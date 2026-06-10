import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

const PacificClock = () => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            dateStyle: "full",
            timeStyle: "medium",
            hour12: true,
        });

        const update = () => setTime(formatter.format(new Date()));
        update();
        const id = window.setInterval(update, 1000);
        return () => window.clearInterval(id);
    }, []);
    return (
        <Typography
            variant="body2"
            sx={{
                color: "text.secondary",
                fontWeight: 500,
                letterSpacing: "0.01em",
            }}
        >
            {time}
        </Typography>
    )
}

export default PacificClock;