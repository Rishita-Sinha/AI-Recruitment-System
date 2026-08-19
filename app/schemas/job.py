from pydantic import BaseModel


class JobRequest(BaseModel):
    # Basic Information
    title: str

    # Requirements
    experience: str
    skills: str
    qualification: str
    location: str = ""

    

    # Complete Job Description
    description: str