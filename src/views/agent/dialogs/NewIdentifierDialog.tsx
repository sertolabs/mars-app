import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@material-ui/core'

import { useSnackbar } from 'notistack'
import { useAgent } from '../../../agent'
import { IIdentityManagerCreateIdentityArgs } from 'daf-core'
import { useHistory } from 'react-router-dom'

interface Props {
  fullScreen: boolean
  open: boolean
  onClose: any
}

const useStyles = makeStyles(() => ({
  formControl: {
    // margin: theme.spacing(1),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    // width: 'fit-content',
  },
}))

function NewAgentDialog(props: Props) {
  const { agent } = useAgent()
  const classes = useStyles()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [alias, setAlias] = useState<string>('')
  const [kms, setKms] = useState<string | undefined>()
  const [keyManagementSystems, setKeyManagementSystems] = useState<string[]>([])
  const [provider, setProvider] = useState<string | undefined>()
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    if (agent) {
      setLoading(true)
      Promise.all([agent.identityManagerGetProviders(), agent.keyManagerGetKeyManagementSystems()])
        .then((r) => {
          setProviders(r[0])
          setKeyManagementSystems(r[1])
          setKms(r[1][0])
        })
        .finally(() => setLoading(false))
        .catch((e) => enqueueSnackbar(e.message, { variant: 'error' }))
    }
  }, [agent, enqueueSnackbar])

  const handleCreate = () => {
    const args: IIdentityManagerCreateIdentityArgs = { provider, kms }
    if (alias) args['alias'] = alias
    setLoading(true)
    agent
      .identityManagerCreateIdentity(args)
      .then((identifier) => {
        props.onClose()
        enqueueSnackbar(identifier.did + ' created', { variant: 'success' })
        history.push('/agent/identity/' + identifier.did)
      })
      .finally(() => setLoading(false))
      .catch((e) => enqueueSnackbar(e.message, { variant: 'error' }))
  }

  return (
    <Dialog
      fullScreen={props.fullScreen}
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">New identifier</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent>
        <form className={classes.form}>
          <FormControl className={classes.formControl} variant="outlined" margin="normal">
            <InputLabel htmlFor="age-native-simple">Provider</InputLabel>
            <Select value={provider} onChange={(e) => setProvider(e.target.value as string)}>
              {providers.map((provider) => (
                <MenuItem value={provider}>{provider}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={classes.formControl} variant="outlined" margin="normal">
            <InputLabel htmlFor="age-native-simple">Key management system</InputLabel>
            <Select value={kms} onChange={(e) => setKms(e.target.value as string)}>
              {keyManagementSystems.map((k) => (
                <MenuItem value={k}>{k}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            label="Alias"
            helperText="Optional"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            margin="normal"
            fullWidth
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.onClose} color="default">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary" autoFocus>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewAgentDialog