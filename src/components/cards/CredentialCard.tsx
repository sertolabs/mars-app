import React, { useState, useEffect } from 'react'
import {
  CardActions,
  IconButton,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  makeStyles,
  MenuList,
  ListSubheader,
  Box,
  DialogActions,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActionAreaLink from '../nav/CardActionAreaLink'
import Avatar from '@material-ui/core/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { UniqueVerifiableCredential } from 'daf-typeorm'
import { IdentityProfile } from '../../types'
import { useAgent, useAgentList } from '../../agent'
import { useSnackbar } from 'notistack'
import PostCredential from './CredentialCardContent/PostCredential'
import ProfileCredential from './CredentialCardContent/ProfileCredential'
import ReactionCredential from './CredentialCardContent/ReactionCredential'
import MessageCredential from './CredentialCardContent/MessageCredential'
import CredentialIcon from '@material-ui/icons/VerifiedUser'
import ProfileIcon from '@material-ui/icons/PermContactCalendar'
import ReactionIcon from '@material-ui/icons/ThumbUp'
import MessageIcon from '@material-ui/icons/Message'
import MoreIcon from '@material-ui/icons/MoreVert'
import QrIcon from '@material-ui/icons/CropFree'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import CodeIcon from '@material-ui/icons/Code'
import AvatarLink from '../nav/AvatarLink'
const QRCode = require('qrcode-react')

interface Props {
  credential: UniqueVerifiableCredential
  type: 'summary' | 'details'
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  footerAvatar: {
    display: 'flex',
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: theme.spacing(1),
  },
  footerDetails: {
    marginLeft: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textOverflow: 'ellipses',
    flexGrow: 1,
  },
  footerBottom: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    // flex: 1
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    marginLeft: 3,
  },
  moreButton: {
    // flex: 1
  },
}))

function CredentialPostCard(props: Props) {
  const {
    credential: { verifiableCredential, hash },
  } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { agent } = useAgent()
  const { agentList, activeAgentIndex } = useAgentList()
  const [loading, setLoading] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [issuer, setIssuer] = useState<IdentityProfile>({
    did: verifiableCredential.issuer.id,
  })
  const [subject, setSubject] = useState<IdentityProfile | undefined>(undefined)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))

  const handleClickCopyButton = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick = async (event: any, index: number) => {
    // setSelectedIndex(index);
    try {
      await agentList[index].agent.dataStoreSaveVerifiableCredential({
        verifiableCredential,
      })
      enqueueSnackbar('Credential copied to: ' + agentList[index].name, {
        variant: 'success',
      })
    } catch (e) {
      enqueueSnackbar(e.message, { variant: 'error' })
    }
    setAnchorEl(null)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(verifiableCredential, null, 2)], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = 'credential.txt'
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
  }

  useEffect(() => {
    setLoading(true)
    Promise.all<IdentityProfile, IdentityProfile>([
      agent.getIdentityProfile({ did: verifiableCredential.issuer.id }),
      agent.getIdentityProfile({
        did: verifiableCredential.credentialSubject.id,
      }),
    ])
      .then((profiles) => {
        setIssuer(profiles[0])
        setSubject(profiles[1])
      })
      .finally(() => setLoading(false))
  }, [agent, verifiableCredential])

  if (loading) {
    return <LinearProgress />
  }

  let contents
  let Icon = CredentialIcon
  if (verifiableCredential.type.includes('Post')) {
    Icon = MessageIcon
    contents = <PostCredential {...props} issuer={issuer} subject={subject} />
  } else if (verifiableCredential.type.includes('Profile')) {
    Icon = ProfileIcon
    contents = <ProfileCredential {...props} issuer={issuer} subject={subject} />
  } else if (verifiableCredential.type.includes('Reaction')) {
    Icon = ReactionIcon
    contents = <ReactionCredential {...props} issuer={issuer} subject={subject} />
  } else if (verifiableCredential.type.includes('Message')) {
    Icon = MessageIcon
    contents = <MessageCredential {...props} issuer={issuer} subject={subject} />
  }

  return (
    <Card elevation={2}>
      <CardActionAreaLink
        to={props.type === 'summary' ? '/agent/credential/' + hash : '/agent/identity/' + subject?.did}
      >
        {contents}
      </CardActionAreaLink>
      <CardActions disableSpacing>
        <Box className={classes.footer}>
          <AvatarLink
            src={issuer.picture}
            to={'/agent/identity/' + issuer.did}
            className={classes.footerAvatar}
          />

          <Box className={classes.footerDetails}>
            <Box className={classes.footerBottom}>
              <Typography variant="body2" color="textSecondary" title={issuer.nickname}>
                {issuer.name}
              </Typography>
              <Icon fontSize="small" color="disabled" className={classes.icon} />
            </Box>
            <Typography variant="caption" color="textSecondary">{`${formatDistanceToNow(
              Date.parse(verifiableCredential.issuanceDate),
            )} ago`}</Typography>
          </Box>

          <IconButton aria-label="More" className={classes.moreButton} onClick={handleClickCopyButton}>
            <MoreIcon />
          </IconButton>
        </Box>
      </CardActions>
      <Menu id="lock-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            setShowQr(true)
          }}
        >
          <ListItemIcon>
            <QrIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Show QR Code
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setShowCode(true)
          }}
        >
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Show source
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Export
          </Typography>
        </MenuItem>

        <MenuList
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Save to
            </ListSubheader>
          }
        >
          {agentList.map((option, index) => (
            <MenuItem
              key={index}
              disabled={
                !option.agent.availableMethods().includes('dataStoreSaveVerifiableCredential') ||
                index === activeAgentIndex
              }
              onClick={(event) => handleMenuItemClick(event, index)}
            >
              <ListItemIcon>
                <Avatar className={classes.small}>{option.name.substr(0, 2)}</Avatar>
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                {option.name}
              </Typography>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Dialog
        fullScreen={fullScreen}
        open={showQr}
        onClose={() => {
          setShowQr(false)
        }}
        maxWidth="md"
        fullWidth
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">Credential</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCode value={verifiableCredential.proof['jwt']} size={512} />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => {
              setShowQr(false)
            }}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={showCode}
        onClose={() => {
          setShowCode(false)
        }}
        maxWidth="md"
        fullWidth
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">Code</DialogTitle>
        <DialogContent>
          <Box fontFamily="Monospace" fontSize="body2.fontSize" m={1}>
            <pre>{JSON.stringify(verifiableCredential, null, 2)}</pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => {
              setShowCode(false)
            }}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default CredentialPostCard