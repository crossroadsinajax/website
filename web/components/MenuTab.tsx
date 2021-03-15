import {
  Box,
  Button,
  Grow,
  MenuItem,
  MenuList,
  Popper,
  Paper,
  ClickAwayListener,
  makeStyles,
} from "@material-ui/core"
import React from "react"
import { Link } from "react-router-dom"

const useStyles = makeStyles({
  root: {},
  menuItem: {
    width: "100%",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
})

type MenuTabProps = {
  name: string
  pages: Array<[string, string]>
}

export const MenuTab: React.FC<MenuTabProps> = ({ name, pages }) => {
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault()
      setOpen(false)
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }

    prevOpen.current = open
  }, [open])

  const classes = useStyles()
  return (
    <Box>
      <Button
        ref={anchorRef}
        aria-controls={open ? "menu-list-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {name}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  {pages.map(([name, to], i) => (
                    <Link key={i} to={to}>
                      <MenuItem
                        className={classes.menuItem}
                        onClick={handleClose}
                      >
                        {name}
                      </MenuItem>
                    </Link>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}
