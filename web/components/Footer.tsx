import React from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import { blueGrey } from '@material-ui/core/colors'

const useStyles = makeStyles({
	root: {
		backgroundColor: blueGrey[50],
		minWidth: '100vw',
		color: 'black',
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		position: 'absolute',
		bottom: 0,
	},
})

type FooterProps = {}

export const Footer: React.FC<FooterProps> = () => {
	const classes = useStyles()
	return (
		<Box py={3} className={classes.root}>
			<Box>
				<Typography align="center" gutterBottom>
					520 Westney Rd South | Ajax, Ontario | L1S6W6
				</Typography>
				<Typography variant="overline">
					Copyright © Crossroads Ajax Community Church
				</Typography>
			</Box>
		</Box>
	)
}
