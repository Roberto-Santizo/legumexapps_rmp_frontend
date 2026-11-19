import { useEffect, useState } from "react"

function getGreetingGT() {
    const hour = Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Guatemala",
            hour: "numeric",
            hour12: false,
        }).format(new Date())
    )

    if (hour >= 5 && hour < 12) return "BUENOS DÍAS"
    if (hour >= 12 && hour < 18) return "BUENAS TARDES"
    return "BUENAS NOCHES"
}

export function useGreetingGT() {
    const [greeting, setGreeting] = useState(getGreetingGT())

    useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreetingGT())
        }, 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return greeting
}
