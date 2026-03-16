from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.application.predict_move import execute_prediction
from src.core.dtos import PredictRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/predict")
def get_move(request: PredictRequest):
    try:
        move = execute_prediction(request)
        return {"row": move.row, "col": move.col}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
