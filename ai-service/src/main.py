import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.application.predict_move import execute_prediction
from src.core.dtos import PredictRequest
from src.core.types import Move

app = FastAPI()

logger = logging.getLogger("api_logger")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Error de validación en {request.url.path}: {exc.errors()}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"message": "Error de validación de datos", "details": exc.errors()},
    )


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/predict")
def get_move(request: PredictRequest):
    try:
        move: Move = execute_prediction(request)
        return {"row": move.row, "col": move.col}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
