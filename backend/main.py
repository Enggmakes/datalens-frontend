from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import json
from typing import Optional
from scipy import stats
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="DataLens Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_column_type(series: pd.Series) -> str:
    """Detect if a column is numeric, categorical, datetime, or text."""
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    # Try parse datetime
    try:
        pd.to_datetime(series.dropna().head(20), infer_datetime_format=True)
        return "datetime"
    except:
        pass
    n_unique = series.nunique()
    n_total = len(series.dropna())
    if n_total == 0:
        return "text"
    ratio = n_unique / n_total
    if ratio < 0.1 or n_unique <= 20:
        return "categorical"
    return "text"

def safe_json(obj):
    """Convert numpy types to Python native types."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj

def compute_statistics(df: pd.DataFrame, col_types: dict) -> dict:
    stats_result = {}
    for col, ctype in col_types.items():
        col_stats = {"type": ctype, "null_count": int(df[col].isnull().sum())}
        if ctype == "numeric":
            s = df[col].dropna()
            col_stats.update({
                "mean": safe_json(s.mean()),
                "median": safe_json(s.median()),
                "std": safe_json(s.std()),
                "min": safe_json(s.min()),
                "max": safe_json(s.max()),
                "q1": safe_json(s.quantile(0.25)),
                "q3": safe_json(s.quantile(0.75)),
                "skewness": safe_json(s.skew()),
                "kurtosis": safe_json(s.kurtosis()),
            })
        elif ctype == "categorical":
            vc = df[col].value_counts()
            col_stats.update({
                "unique_count": int(df[col].nunique()),
                "top_values": {str(k): int(v) for k, v in vc.head(10).items()},
            })
        elif ctype == "datetime":
            dt_series = pd.to_datetime(df[col], errors='coerce').dropna()
            if len(dt_series) > 0:
                col_stats.update({
                    "min": safe_json(dt_series.min()),
                    "max": safe_json(dt_series.max()),
                })
        stats_result[col] = col_stats
    return stats_result

def suggest_charts(col_types: dict, df: pd.DataFrame) -> list:
    suggestions = []
    numeric_cols = [c for c, t in col_types.items() if t == "numeric"]
    categorical_cols = [c for c, t in col_types.items() if t == "categorical"]
    datetime_cols = [c for c, t in col_types.items() if t == "datetime"]

    # Bar chart: categorical + numeric
    if categorical_cols and numeric_cols:
        suggestions.append({
            "type": "bar",
            "title": "Category Comparison",
            "description": f"Compare {numeric_cols[0]} across {categorical_cols[0]} groups",
            "x": categorical_cols[0],
            "y": numeric_cols[0],
            "icon": "BarChart2"
        })

    # Line chart: datetime + numeric
    if datetime_cols and numeric_cols:
        suggestions.append({
            "type": "line",
            "title": "Trend Over Time",
            "description": f"Track {numeric_cols[0]} over time",
            "x": datetime_cols[0],
            "y": numeric_cols[0],
            "icon": "TrendingUp"
        })

    # Scatter plot: 2+ numeric cols
    if len(numeric_cols) >= 2:
        suggestions.append({
            "type": "scatter",
            "title": "Correlation Analysis",
            "description": f"Explore relationship between {numeric_cols[0]} and {numeric_cols[1]}",
            "x": numeric_cols[0],
            "y": numeric_cols[1],
            "icon": "ScatterChart"
        })

    # Pie chart: categorical with manageable values
    if categorical_cols:
        n_unique = df[categorical_cols[0]].nunique()
        if n_unique <= 10:
            suggestions.append({
                "type": "pie",
                "title": "Distribution Breakdown",
                "description": f"Distribution of {categorical_cols[0]}",
                "x": categorical_cols[0],
                "y": numeric_cols[0] if numeric_cols else None,
                "icon": "PieChart"
            })

    # Histogram: numeric
    if numeric_cols:
        suggestions.append({
            "type": "histogram",
            "title": "Value Distribution",
            "description": f"Frequency distribution of {numeric_cols[0]}",
            "x": numeric_cols[0],
            "y": None,
            "icon": "BarChart"
        })

    # Heatmap (correlation): 3+ numeric
    if len(numeric_cols) >= 3:
        suggestions.append({
            "type": "heatmap",
            "title": "Correlation Matrix",
            "description": "Correlation between all numeric columns",
            "x": None,
            "y": None,
            "icon": "Grid"
        })

    # Area chart: time + numeric
    if datetime_cols and numeric_cols:
        suggestions.append({
            "type": "area",
            "title": "Area Trend",
            "description": f"Cumulative trend of {numeric_cols[0]} over time",
            "x": datetime_cols[0],
            "y": numeric_cols[0],
            "icon": "Activity"
        })

    # If only numeric cols and no time/categorical:
    if numeric_cols and not categorical_cols and not datetime_cols:
        suggestions.append({
            "type": "box",
            "title": "Box Plot",
            "description": f"Outlier and spread analysis of numeric data",
            "x": numeric_cols[0],
            "y": None,
            "icon": "BoxSelect"
        })

    return suggestions

def compute_correlations(df: pd.DataFrame, col_types: dict) -> dict:
    numeric_cols = [c for c, t in col_types.items() if t == "numeric"]
    if len(numeric_cols) < 2:
        return {}
    corr = df[numeric_cols].corr()
    result = {}
    for col in numeric_cols:
        result[col] = {}
        for col2 in numeric_cols:
            val = corr.loc[col, col2]
            result[col][col2] = None if (np.isnan(val) or np.isinf(val)) else round(float(val), 4)
    return result

def prepare_chart_data(df: pd.DataFrame, chart_type: str, x_col: str, y_col: Optional[str], col_types: dict, bins: int = 20) -> list:
    if chart_type == "histogram" and x_col:
        series = df[x_col].dropna()
        hist, edges = np.histogram(series, bins=bins)
        return [{"bin": f"{edges[i]:.1f}-{edges[i+1]:.1f}", "count": int(hist[i])} for i in range(len(hist))]

    if chart_type == "heatmap":
        numeric_cols = [c for c, t in col_types.items() if t == "numeric"]
        corr = df[numeric_cols].corr()
        result = []
        for col1 in numeric_cols:
            for col2 in numeric_cols:
                val = corr.loc[col1, col2]
                result.append({
                    "x": col1, "y": col2,
                    "value": None if (np.isnan(val) or np.isinf(val)) else round(float(val), 4)
                })
        return result

    if chart_type == "pie" and x_col:
        vc = df[x_col].value_counts().head(10)
        return [{"name": str(k), "value": int(v)} for k, v in vc.items()]

    if chart_type in ("bar",) and x_col and y_col:
        grouped = df.groupby(x_col)[y_col].mean().reset_index()
        grouped = grouped.head(20)
        return [{x_col: str(row[x_col]), y_col: safe_json(row[y_col])} for _, row in grouped.iterrows()]

    if chart_type in ("line", "area") and x_col and y_col:
        dt_col = col_types.get(x_col) == "datetime"
        if dt_col:
            df2 = df.copy()
            df2[x_col] = pd.to_datetime(df2[x_col], errors='coerce')
            df2 = df2.dropna(subset=[x_col, y_col])
            df2 = df2.sort_values(x_col)
            df2[x_col] = df2[x_col].dt.strftime('%Y-%m-%d')
            sample = df2[[x_col, y_col]].head(200)
        else:
            df2 = df[[x_col, y_col]].dropna().head(200)
        return [{x_col: str(row[x_col]), y_col: safe_json(row[y_col])} for _, row in df2.iterrows()]

    if chart_type == "scatter" and x_col and y_col:
        df2 = df[[x_col, y_col]].dropna().head(500)
        return [{x_col: safe_json(row[x_col]), y_col: safe_json(row[y_col])} for _, row in df2.iterrows()]

    if chart_type == "box" and x_col:
        series = df[x_col].dropna()
        q1, q3 = series.quantile(0.25), series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers = series[(series < lower) | (series > upper)].tolist()
        return [{
            "min": safe_json(series.min()),
            "q1": safe_json(q1),
            "median": safe_json(series.median()),
            "q3": safe_json(q3),
            "max": safe_json(series.max()),
            "mean": safe_json(series.mean()),
            "outliers": [safe_json(o) for o in outliers[:50]]
        }]

    return []

# In-memory storage per session (use Redis in production)
sessions = {}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and parse a CSV or Excel file, return schema, stats, suggestions."""
    content = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content), on_bad_lines='skip')
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Detect column types
    col_types = {col: detect_column_type(df[col]) for col in df.columns}

    # Compute stats
    statistics = compute_statistics(df, col_types)

    # Suggest charts
    chart_suggestions = suggest_charts(col_types, df)

    # Compute correlations
    correlations = compute_correlations(df, col_types)

    # Detect domain (heuristic)
    domain = detect_domain(df)

    # Store session data
    session_id = str(hash(content))
    sessions[session_id] = {"df": df, "col_types": col_types}

    # Preview rows
    preview = df.head(20).replace({np.nan: None}).to_dict(orient="records")
    preview = [{k: safe_json(v) for k, v in row.items()} for row in preview]

    return {
        "session_id": session_id,
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "col_types": col_types,
        "statistics": statistics,
        "chart_suggestions": chart_suggestions,
        "correlations": correlations,
        "domain": domain,
        "preview": preview,
    }

def detect_domain(df: pd.DataFrame) -> str:
    """Heuristically detect the data domain based on column names."""
    cols_lower = " ".join(df.columns.str.lower())
    if any(w in cols_lower for w in ["patient", "disease", "diagnosis", "hospital", "medical", "symptom", "blood", "pressure"]):
        return "Healthcare"
    if any(w in cols_lower for w in ["student", "score", "grade", "marks", "exam", "subject", "gpa"]):
        return "Education"
    if any(w in cols_lower for w in ["sale", "revenue", "profit", "customer", "product", "order", "price", "quantity"]):
        return "Sales & Business"
    if any(w in cols_lower for w in ["stock", "close", "open", "volume", "trade", "market", "index"]):
        return "Finance"
    if any(w in cols_lower for w in ["employee", "salary", "department", "hire", "payroll", "attendance"]):
        return "HR & Workforce"
    if any(w in cols_lower for w in ["lat", "lon", "city", "country", "region", "state", "zip"]):
        return "Geospatial"
    return "General"

@app.post("/api/chart-data")
async def get_chart_data(payload: dict):
    """Return processed data for a specific chart type."""
    session_id = payload.get("session_id")
    chart_type = payload.get("chart_type")
    x_col = payload.get("x_col")
    y_col = payload.get("y_col")
    bins = payload.get("bins", 20)

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please re-upload your file.")

    session = sessions[session_id]
    df = session["df"]
    col_types = session["col_types"]

    data = prepare_chart_data(df, chart_type, x_col, y_col, col_types, bins)
    return {"data": data, "x_col": x_col, "y_col": y_col, "chart_type": chart_type}

@app.post("/api/custom-chart")
async def custom_chart(payload: dict):
    """Allow user to build any custom chart with selected columns."""
    session_id = payload.get("session_id")
    chart_type = payload.get("chart_type")
    x_col = payload.get("x_col")
    y_col = payload.get("y_col")
    agg = payload.get("aggregation", "mean")
    bins = payload.get("bins", 20)

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]
    df = session["df"]
    col_types = session["col_types"]

    # Apply aggregation for bar charts
    if chart_type == "bar" and x_col and y_col:
        grouped = df.groupby(x_col)[y_col]
        if agg == "mean":
            grouped = grouped.mean()
        elif agg == "sum":
            grouped = grouped.sum()
        elif agg == "count":
            grouped = grouped.count()
        elif agg == "max":
            grouped = grouped.max()
        elif agg == "min":
            grouped = grouped.min()
        grouped = grouped.reset_index().head(25)
        data = [{x_col: str(row[x_col]), y_col: safe_json(row[y_col])} for _, row in grouped.iterrows()]
    else:
        data = prepare_chart_data(df, chart_type, x_col, y_col, col_types, bins)

    return {"data": data, "x_col": x_col, "y_col": y_col, "chart_type": chart_type}

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
