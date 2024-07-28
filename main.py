from contextlib import asynccontextmanager
from traceback import print_exc

import uvicorn

import aiosqlite

from fastapi import FastAPI, HTTPException

from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles



app = FastAPI()

DATABASE = "scores.db"

class Score(BaseModel):
    score: int

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start up
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL
        )
        """)
        await db.commit()
    yield
    # Clean up
    # Add any cleanup code here if necessary

app.router.lifespan_context = lifespan

@app.get("/score")
async def get_score():
    """ ## Получение очков из базы данных """
    async with aiosqlite.connect(DATABASE) as db:
        async with db.execute("SELECT score FROM scores ORDER BY id DESC LIMIT 1") as cursor:
            row = await cursor.fetchone()
            if row:
                return {"score": row[0]}
            return {"score": 0}

@app.post("/score")
async def update_score(score: Score):
    """ ## Обновление очков """
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("INSERT INTO scores (score) VALUES (?)", (score.score,))
        await db.commit()
        return score

# Mount static files
app.mount("/", StaticFiles(directory="src", html=True), name="static")

if __name__ == "__main__":
    # https://chatgpt.com/share/9fbc8200-5f5d-47e6-a9f7-5cdeb6eee837
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except:
        print_exc()