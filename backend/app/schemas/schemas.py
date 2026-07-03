from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ─── Auth Schemas ────────────────────────────────────────────────────────────

class SendOtpRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "customer"

class VerifyOtpRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    code: str
    role: str = "customer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    setup_complete: bool

# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    setup_complete: bool

    class Config:
        orm_mode = True

# ─── Customer Schemas ─────────────────────────────────────────────────────────

class CustomerProfileBase(BaseModel):
    full_name: str
    avatar_url: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfileResponse(CustomerProfileBase):
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# ─── Provider Schemas ─────────────────────────────────────────────────────────

class ProviderServiceBase(BaseModel):
    service_name: str
    price: float
    description: Optional[str] = None

class ProviderServiceResponse(ProviderServiceBase):
    id: int
    provider_id: str

    class Config:
        orm_mode = True

class ProviderImageResponse(BaseModel):
    id: int
    provider_id: str
    image_url: str

    class Config:
        orm_mode = True

class ProviderDocumentResponse(BaseModel):
    id: int
    provider_id: str
    document_type: str
    document_url: str

    class Config:
        orm_mode = True

class ProviderProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    profile_photo: Optional[str] = None
    profession: Optional[str] = None
    subcategory: Optional[str] = None
    service_description: Optional[str] = None
    experience_years: Optional[int] = 0
    per_visit_charge: Optional[float] = 0.0
    service_charge: Optional[float] = 0.0
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    service_radius_km: Optional[float] = 10.0
    is_available: Optional[bool] = True
    approval_status: Optional[str] = "pending"
    avg_rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0

class ProviderProfileCreate(ProviderProfileBase):
    pass

class ProviderProfileResponse(ProviderProfileBase):
    user_id: str
    services: List[ProviderServiceResponse] = []
    images: List[ProviderImageResponse] = []
    documents: List[ProviderDocumentResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# ─── Booking Schemas ──────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    provider_id: str
    service_name: str
    scheduled_at: datetime
    address: str
    notes: Optional[str] = None
    amount: float

class BookingResponse(BaseModel):
    id: str
    customer_id: str
    provider_id: str
    service_name: str
    scheduled_at: datetime
    address: str
    notes: Optional[str] = None
    amount: float
    status: str
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    customer: Optional[CustomerProfileBase] = None
    provider: Optional[ProviderProfileBase] = None

    class Config:
        orm_mode = True

class BookingStatusUpdate(BaseModel):
    status: str

# ─── Review Schemas ───────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    booking_id: str
    provider_id: str
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    provider_id: str
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    customer: Optional[CustomerProfileBase] = None

    class Config:
        orm_mode = True

# ─── Notification Schemas ─────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    booking_id: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatCreate(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    sender_role: str
    message: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
