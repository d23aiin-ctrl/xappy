import asyncio

from sqlalchemy import select, or_

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus


SEED_PIN = "1234"

SEED_USERS = [
    {
        "badge_number": "WKR-1001",
        "phone_number": "+919990001001",
        "full_name": "Worker One",
        "role": UserRole.WORKER,
    },
    {
        "badge_number": "SUP-2001",
        "phone_number": "+919990002001",
        "full_name": "Supervisor One",
        "role": UserRole.SUPERVISOR,
    },
    {
        "badge_number": "HSE-3001",
        "phone_number": "+919990003001",
        "full_name": "HSE Manager One",
        "role": UserRole.HSE_MANAGER,
    },
    {
        "badge_number": "CMP-4001",
        "phone_number": "+919990004001",
        "full_name": "Compliance One",
        "role": UserRole.COMPLIANCE_OFFICER,
    },
    {
        "badge_number": "ADM-9001",
        "phone_number": "+919990009001",
        "full_name": "Admin One",
        "role": UserRole.ADMIN,
    },
]


async def main() -> None:
    pin_hash = get_password_hash(SEED_PIN)

    async with AsyncSessionLocal() as session:
        for payload in SEED_USERS:
            badge_number = payload["badge_number"]
            phone_number = payload["phone_number"]

            result = await session.execute(
                select(User).where(
                    or_(
                        User.badge_number == badge_number,
                        User.phone_number == phone_number,
                    )
                )
            )
            user = result.scalar_one_or_none()

            if user:
                user.badge_number = badge_number
                user.phone_number = phone_number
                user.full_name = payload["full_name"]
                user.role = payload["role"]
                user.status = UserStatus.ACTIVE
                user.pin_hash = pin_hash
                action = "updated"
            else:
                user = User(
                    badge_number=badge_number,
                    phone_number=phone_number,
                    full_name=payload["full_name"],
                    role=payload["role"],
                    status=UserStatus.ACTIVE,
                    pin_hash=pin_hash,
                )
                session.add(user)
                action = "created"

            print(f"{action}: {badge_number} ({payload['role'].value})")

        await session.commit()

    print(f"Seed complete. PIN for all users: {SEED_PIN}")


if __name__ == "__main__":
    asyncio.run(main())
