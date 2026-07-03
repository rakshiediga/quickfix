import os
import uuid
import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.database import get_db
from app.config import settings
from app.models.models import User, ProviderProfile, ProviderService, ProviderImage, ProviderDocument
from app.schemas.schemas import ProviderProfileCreate, ProviderProfileResponse
from app.services.auth import get_current_user_id
from app.routers.auth import _memory_users

router = APIRouter(prefix="/provider", tags=["Provider Profiles"])

# In-memory provider fallback stores
_memory_provider_profiles = {}
_memory_provider_services = {}
_memory_provider_images = {}
_memory_provider_documents = {}

def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/profile", response_model=ProviderProfileResponse)
def get_provider_own_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Provider profile not found")
        return profile
    except OperationalError:
        profile = _memory_provider_profiles.get(user_id)
        if not profile:
            profile = {
                "user_id": user_id,
                "full_name": "New Provider Profile",
                "phone": None,
                "email": None,
                "profile_photo": None,
                "profession": None,
                "subcategory": None,
                "service_description": None,
                "experience_years": 0,
                "per_visit_charge": 0.0,
                "service_charge": 0.0,
                "address": None,
                "city": None,
                "state": None,
                "pin_code": None,
                "lat": None,
                "lng": None,
                "service_radius_km": 10.0,
                "is_available": True,
                "approval_status": "approved",  # Auto-approve in memory fallback for easy demo
                "avg_rating": 5.0,
                "total_reviews": 0,
                "services": [],
                "images": [],
                "documents": []
            }
            _memory_provider_profiles[user_id] = profile
        return profile

@router.get("/profile/{id}", response_model=ProviderProfileResponse)
def get_provider_profile_by_id(id: str, db: Session = Depends(get_db)):
    try:
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Provider profile not found")
        return profile
    except OperationalError:
        profile = _memory_provider_profiles.get(id)
        if not profile:
            raise HTTPException(status_code=404, detail="Provider profile not found")
        return profile

@router.post("/profile", response_model=ProviderProfileResponse)
def update_provider_profile(req: ProviderProfileCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user_id).first()
        if not profile:
            profile = ProviderProfile(user_id=user_id)
            db.add(profile)
            
        for field, val in req.dict(exclude_unset=True).items():
            setattr(profile, field, val)
            
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.setup_complete = True
            
        db.commit()
        db.refresh(profile)
        return profile
    except OperationalError:
        profile = _memory_provider_profiles.get(user_id, {
            "user_id": user_id,
            "full_name": "New Provider Profile",
            "phone": None,
            "email": None,
            "profile_photo": None,
            "profession": None,
            "subcategory": None,
            "service_description": None,
            "experience_years": 0,
            "per_visit_charge": 0.0,
            "service_charge": 0.0,
            "address": None,
            "city": None,
            "state": None,
            "pin_code": None,
            "lat": None,
            "lng": None,
            "service_radius_km": 10.0,
            "is_available": True,
            "approval_status": "approved",
            "avg_rating": 5.0,
            "total_reviews": 0,
            "services": [],
            "images": [],
            "documents": []
        })
        
        for field, val in req.dict(exclude_unset=True).items():
            profile[field] = val
            
        _memory_provider_profiles[user_id] = profile
        
        # Update user status in memory
        for identifier, data in _memory_users.items():
            if data["id"] == user_id:
                data["setup_complete"] = True
                
        return profile

@router.post("/upload")
async def upload_file_endpoint(file: UploadFile = File(...)):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    file_url = f"http://localhost:8000/{settings.UPLOAD_DIR}/{unique_filename}"
    return {"url": file_url}

@router.post("/services")
def add_provider_service(name: str = Form(...), price: float = Form(...), description: Optional[str] = Form(None), user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        srv = ProviderService(
            provider_id=user_id,
            service_name=name,
            price=price,
            description=description
        )
        db.add(srv)
        db.commit()
    except OperationalError:
        if user_id not in _memory_provider_services:
            _memory_provider_services[user_id] = []
        srv_id = len(_memory_provider_services[user_id]) + 1
        srv_dict = {
            "id": srv_id,
            "provider_id": user_id,
            "service_name": name,
            "price": price,
            "description": description
        }
        _memory_provider_services[user_id].append(srv_dict)
        
        # update profile list
        profile = _memory_provider_profiles.get(user_id)
        if profile:
            profile["services"] = _memory_provider_services[user_id]
            
    return {"message": "Service added successfully"}

@router.post("/portfolio-images")
def add_portfolio_image(image_url: str = Form(...), user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        img = ProviderImage(provider_id=user_id, image_url=image_url)
        db.add(img)
        db.commit()
    except OperationalError:
        if user_id not in _memory_provider_images:
            _memory_provider_images[user_id] = []
        img_id = len(_memory_provider_images[user_id]) + 1
        img_dict = {
            "id": img_id,
            "provider_id": user_id,
            "image_url": image_url
        }
        _memory_provider_images[user_id].append(img_dict)
        
        # update profile list
        profile = _memory_provider_profiles.get(user_id)
        if profile:
            profile["images"] = _memory_provider_images[user_id]
            
    return {"message": "Image added successfully"}

@router.get("/list")
def list_providers(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 10.0,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(ProviderProfile).filter(
            ProviderProfile.is_available == True,
            ProviderProfile.approval_status == "approved"
        )
        if category and category != "all":
            query = query.filter(ProviderProfile.profession == category)
            
        all_p = query.all()
        results = []
        for p in all_p:
            dist = None
            if lat is not None and lng is not None and p.lat is not None and p.lng is not None:
                dist = haversine_km(lat, lng, p.lat, p.lng)
                if dist > radius:
                    continue
            
            results.append({
                "id": p.user_id,
                "full_name": p.full_name,
                "phone": p.phone,
                "email": p.email,
                "profile_photo": p.profile_photo,
                "profession": p.profession,
                "subcategory": p.subcategory,
                "service_description": p.service_description,
                "experience_years": p.experience_years,
                "per_visit_charge": p.per_visit_charge,
                "service_charge": p.service_charge,
                "address": p.address,
                "city": p.city,
                "state": p.state,
                "pin_code": p.pin_code,
                "lat": p.lat,
                "lng": p.lng,
                "service_radius_km": p.service_radius_km,
                "is_available": p.is_available,
                "approval_status": p.approval_status,
                "avg_rating": p.avg_rating,
                "total_reviews": p.total_reviews,
                "distKm": dist
            })
            
    except OperationalError:
        # Load from in-memory fallback
        results = []
        for pid, p in _memory_provider_profiles.items():
            if not p.get("is_available", True) or p.get("approval_status") != "approved":
                continue
            if category and category != "all" and p.get("profession") != category:
                continue
                
            dist = None
            plat = p.get("lat")
            plng = p.get("lng")
            if lat is not None and lng is not None and plat is not None and plng is not None:
                dist = haversine_km(lat, lng, plat, plng)
                if dist > radius:
                    continue
                    
            results.append({
                "id": p["user_id"],
                "full_name": p["full_name"],
                "phone": p["phone"],
                "email": p["email"],
                "profile_photo": p["profile_photo"],
                "profession": p["profession"],
                "subcategory": p["subcategory"],
                "service_description": p["service_description"],
                "experience_years": p["experience_years"],
                "per_visit_charge": p["per_visit_charge"],
                "service_charge": p["service_charge"],
                "address": p["address"],
                "city": p["city"],
                "state": p["state"],
                "pin_code": p["pin_code"],
                "lat": plat,
                "lng": plng,
                "service_radius_km": p["service_radius_km"],
                "is_available": p["is_available"],
                "approval_status": p["approval_status"],
                "avg_rating": p["avg_rating"],
                "total_reviews": p["total_reviews"],
                "distKm": dist
            })
            
    if lat is not None and lng is not None:
        results.sort(key=lambda x: x["distKm"] if x["distKm"] is not None else 99999)
        
    return results
