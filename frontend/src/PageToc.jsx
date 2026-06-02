import { useMemo, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const PageToc = ({ items = [], label = "Contents" }) => {
  const [open, setOpen] = useState(false);

  const hasItems = items.length > 0;

  const visibleItems = useMemo(
    () => items.filter((item) => item?.id && item?.label),
    [items]
  );

  const handleNavigate = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setOpen(false);
  };

  if (!hasItems) {
    return null;
  }

  return (
    <>
      {!open && (
        <Box className="page-toc-trigger">
          <IconButton
            type="button"
            onClick={() => setOpen(true)}
            className="page-toc-button"
            aria-label={`Open ${label.toLowerCase()}`}
          >
            <MenuIcon fontSize="small" />
            <Typography variant="caption" className="page-toc-button-label">
              {label}
            </Typography>
          </IconButton>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        className="page-toc-drawer"
        slotProps={{
          paper: {
            sx: {
              width: 280,
              maxWidth: "85vw",
              overflowX: "hidden",
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            },
          },
        }}
      >
        <Box className="page-toc-panel">
          <Typography variant="h6" className="page-toc-title">
            {label}
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

          <List dense disablePadding className="page-toc-list">
            {visibleItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`page-toc-item page-toc-level-${item.level || 1}`}
                sx={{ pl: item.level === 2 ? 4 : 2 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default PageToc;