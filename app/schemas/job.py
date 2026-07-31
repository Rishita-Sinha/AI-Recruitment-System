from pydantic import BaseModel


class JobRequest(BaseModel):
    title: str
    experience: str
    skills: str
    description: str