import React from 'react'
import { Box, Container, makeStyles } from '@material-ui/core'
import WebSocketProvider from './Websocket'

const useStyles = makeStyles({
	root: {
		minHeight: '100vh',
		position: 'relative',
	},
})

type HomeProps = {
	ws: WebSocketProvider
}

const Home: React.FC<HomeProps> = () => {
	const classes = useStyles()
	return (
		<Container>
			<Box className={classes.root}>
				<h1>Hello</h1>
			</Box>
		</Container>
	)
}

export default Home
