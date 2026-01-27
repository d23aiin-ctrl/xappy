import json
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "healthcare_demo.json"


def load_healthcare_data() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _extract_filters(query: str, data: Dict[str, Any]) -> Dict[str, Any]:
    text = query.lower()
    districts = [d for d in data.get("districts", []) if d.lower() in text]
    specialties = [s for s in data.get("specialties", []) if s.lower() in text]
    return {
        "districts": districts,
        "specialties": specialties,
    }

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, cos, sin, asin, sqrt

    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return r * c


def _nearest_district(location: Dict[str, Any], data: Dict[str, Any]) -> Optional[str]:
    centroids = data.get("district_centroids", {})
    if not centroids:
        return None

    lat = location.get("latitude")
    lon = location.get("longitude")
    if lat is None or lon is None:
        return None

    nearest = None
    nearest_distance = None
    for district, coords in centroids.items():
        distance = _haversine_km(lat, lon, coords.get("latitude"), coords.get("longitude"))
        if nearest_distance is None or distance < nearest_distance:
            nearest = district
            nearest_distance = distance
    return nearest


def build_context(query: str, location: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    data = load_healthcare_data()
    text = query.lower().strip()
    filters = _extract_filters(query, data)
    nearest = _nearest_district(location, data) if location else None

    if nearest and not filters["districts"]:
        filters["districts"] = [nearest]

    if any(keyword in text for keyword in ["hospital", "clinic", "facility", "doctor", "specialty"]):
        return {
            "type": "directory",
            "facilities": data.get("facilities", []),
            "doctors": data.get("doctors", []),
            "specialties": data.get("specialties", []),
            "districts": data.get("districts", []),
            "filters": filters,
            "nearest_district": nearest,
        }

    if any(keyword in text for keyword in ["symptom", "fever", "cough", "headache", "pain", "vomit", "diarrhea"]):
        return {
            "type": "symptom_guidance",
            "disclaimer": data.get("disclaimer"),
            "emergency": data.get("emergency", {}),
            "filters": filters,
        }

    if any(keyword in text for keyword in ["vaccination", "vaccine", "polio", "dengue", "campaign"]):
        return {
            "type": "vaccination",
            "campaigns": data.get("vaccination_campaigns", []),
            "programs": data.get("vaccination_programs", []),
            "districts": data.get("districts", []),
            "filters": filters,
            "nearest_district": nearest,
        }

    tamil_bp_terms = ["அழுத்தம்", "ரத்த அழுத்தம்", "பிபி"]
    tamil_lipid_terms = ["கொழுப்பு", "கொலஸ்ட்ரால்"]
    tamil_diabetes_terms = ["நீரிழிவு"]
    tamil_lab_terms = ["ரத்த சர்க்கரை", "சர்க்கரை", "எச்.பி.ஏ.1சி"]
    sinhala_bp_terms = ["රක්ත පීඩනය", "බීපී"]
    sinhala_lipid_terms = ["කොලෙස්ට්රෝල්", "කොලෙස්ටරෝල්", "තෙල්"]
    sinhala_diabetes_terms = ["දියවැඩියාව"]
    sinhala_lab_terms = ["රුධිර සීනි", "රক্ত සීනි", "HbA1c"]
    bp_hit = (
        "bp" in text
        or "blood pressure" in text
        or any(term in text for term in tamil_bp_terms)
        or any(term in text for term in sinhala_bp_terms)
    )
    bp_lab_terms = ["range", "normal", "reading", "report", "lab"]
    if any(term in text for term in tamil_lab_terms) or any(term in text for term in sinhala_lab_terms):
        return {
            "type": "lab_explain",
            "ranges": data.get("lab_ranges", []),
            "disclaimer": data.get("disclaimer"),
        }
    if bp_hit:
        if any(term in text for term in bp_lab_terms):
            return {
                "type": "lab_explain",
                "ranges": data.get("lab_ranges", []),
                "disclaimer": data.get("disclaimer"),
            }
        return {
            "type": "health_tips",
            "tips": data.get("health_tips", []),
            "disclaimer": data.get("disclaimer"),
        }
    if any(term in text for term in tamil_lipid_terms) or any(term in text for term in sinhala_lipid_terms):
        return {
            "type": "health_tips",
            "tips": data.get("health_tips", []),
            "disclaimer": data.get("disclaimer"),
        }
    if any(term in text for term in tamil_diabetes_terms) or any(term in text for term in sinhala_diabetes_terms):
        return {
            "type": "health_tips",
            "tips": data.get("health_tips", []),
            "disclaimer": data.get("disclaimer"),
        }

    if any(keyword in text for keyword in ["tips", "advice", "prevent", "prevention", "healthy", "diet", "exercise", "wellbeing"]):
        return {
            "type": "health_tips",
            "tips": data.get("health_tips", []),
            "disclaimer": data.get("disclaimer"),
        }

    if any(keyword in text for keyword in ["lab", "report", "blood sugar", "hba1c"]):
        return {
            "type": "lab_explain",
            "ranges": data.get("lab_ranges", []),
            "disclaimer": data.get("disclaimer"),
        }

    if any(keyword in text for keyword in ["complaint", "feedback"]):
        return {
            "type": "complaint",
            "categories": data.get("complaints", {}).get("categories", []),
            "acknowledgement": data.get("complaints", {}).get("acknowledgement"),
        }

    if any(keyword in text for keyword in ["pregnancy", "child", "childcare", "baby", "infant", "antenatal", "milestone"]):
        return {
            "type": "pregnancy_childcare",
            "topics": data.get("pregnancy_childcare", []),
        }

    if any(keyword in text for keyword in ["alert", "advisory", "outbreak"]):
        return {
            "type": "alerts",
            "alerts": data.get("alerts", []),
            "filters": filters,
            "nearest_district": nearest,
        }

    if any(keyword in text for keyword in ["emergency", "ambulance", "urgent"]):
        return {
            "type": "emergency",
            "emergency": data.get("emergency", {}),
            "ambulances": data.get("ambulance_services", []),
            "ambulance_details": data.get("ambulance_details", {}),
            "districts": data.get("districts", []),
            "filters": filters,
            "nearest_district": nearest,
        }

    return {
        "type": "general",
        "disclaimer": data.get("disclaimer"),
        "districts": data.get("districts", []),
        "specialties": data.get("specialties", []),
        "alerts": data.get("alerts", []),
        "filters": filters,
        "nearest_district": nearest,
    }
