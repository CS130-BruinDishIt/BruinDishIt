import { useEffect, useState } from "react";
import { Fab, Fade } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function BackToTop({ showAfter = 200, bottom = 24, right = 24 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => { setVisible(window.scrollY > showAfter); };
        window.addEventListener("scroll", handleScroll);
        return () => { window.removeEventListener("scroll", handleScroll); };
    }, [showAfter]);

    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };

    return (
        <Fade in={visible}>
            <Fab
                size="medium"
                onClick={scrollToTop}
                sx={{
                    position: "fixed",
                    bottom,
                    right,
                    zIndex: 1200,
                    bgcolor: "#525a7a",
                    color: "#fff",
                    "&:hover": {
                        bgcolor: "#434a67",
                    },
                }}
            >
                <KeyboardArrowUpIcon />
            </Fab>
        </Fade>
    );
}