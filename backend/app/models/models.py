import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)  # Will match Firebase/Supabase-like UUID or custom format
    email = Column(String(100), unique=True, nullable=True, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    role = Column(Enum("customer", "provider", "admin", name="user_roles"), nullable=False, default="customer")
    setup_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    provider_profile = relationship("ProviderProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class CustomerProfile(Base):
    __tablename__ = "customers"
    
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(50), nullable=True)
    state = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="customer_profile")
    bookings = relationship("Booking", back_populates="customer", cascade="all, delete")

class ProviderProfile(Base):
    __tablename__ = "providers"
    
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    profile_photo = Column(String(255), nullable=True)
    profession = Column(String(100), nullable=True)  # Service Category (plumber, electrician, etc.)
    subcategory = Column(String(100), nullable=True)
    service_description = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    per_visit_charge = Column(Float, default=0.0)
    service_charge = Column(Float, default=0.0)      # service rate
    address = Column(Text, nullable=True)
    city = Column(String(50), nullable=True)
    state = Column(String(50), nullable=True)
    pin_code = Column(String(10), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    service_radius_km = Column(Float, default=10.0)
    is_available = Column(Boolean, default=True)      # availability switch
    approval_status = Column(Enum("pending", "approved", "rejected", name="approval_statuses"), default="pending")
    avg_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="provider_profile")
    bookings = relationship("Booking", back_populates="provider", cascade="all, delete")
    services = relationship("ProviderService", back_populates="provider", cascade="all, delete-orphan")
    images = relationship("ProviderImage", back_populates="provider", cascade="all, delete-orphan")
    documents = relationship("ProviderDocument", back_populates="provider", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="provider", cascade="all, delete-orphan")

class ProviderService(Base):
    __tablename__ = "provider_services"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String(50), ForeignKey("providers.user_id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    price = Column(Float, default=0.0)
    description = Column(Text, nullable=True)

    provider = relationship("ProviderProfile", back_populates="services")

class ProviderImage(Base):
    __tablename__ = "provider_images"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String(50), ForeignKey("providers.user_id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)

    provider = relationship("ProviderProfile", back_populates="images")

class ProviderDocument(Base):
    __tablename__ = "provider_documents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String(50), ForeignKey("providers.user_id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # e.g., Aadhar, license, certification
    document_url = Column(String(255), nullable=False)

    provider = relationship("ProviderProfile", back_populates="documents")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String(50), primary_key=True)  # e.g., BK1234567
    customer_id = Column(String(50), ForeignKey("customers.user_id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(String(50), ForeignKey("providers.user_id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    address = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    amount = Column(Float, default=0.0)
    status = Column(Enum("pending", "accepted", "in_progress", "completed", "cancelled", name="booking_statuses_list"), default="pending")
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("CustomerProfile", back_populates="bookings")
    provider = relationship("ProviderProfile", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("Chat", back_populates="booking", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(String(50), primary_key=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.user_id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(String(50), ForeignKey("providers.user_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="review")
    provider = relationship("ProviderProfile", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # new_booking, booking_accepted, etc.
    title = Column(String(100), nullable=False)
    body = Column(Text, nullable=False)
    booking_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(String(50), primary_key=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(50), nullable=False)
    sender_role = Column(String(20), nullable=False)  # customer | provider
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="chat_messages")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(50), primary_key=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(30), default="cash")  # card, cash, UPI
    status = Column(String(30), default="pending")        # pending, paid, refunded
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")
