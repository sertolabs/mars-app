import React, { useState, useEffect } from 'react'
import { LinearProgress, ListItemAvatar, ListItemText } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import { IdentityProfile } from '../../types'
import { useAgent } from '../../agent'
import ListItemLink from './ListItemLink'

interface Props {
  did: string
  type: 'summary' | 'details'
}

function IdentityListItemLink(props: Props) {
  const { did } = props
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const [identity, setIdentity] = useState<IdentityProfile>({ did, name: did })

  useEffect(() => {
    if (did) {
      setLoading(true)
      agent
        .getIdentityProfile({ did })
        .then(setIdentity)
        .finally(() => setLoading(false))
    }
  }, [agent, did])

  return (
    <ListItemLink to={'/agent/identity/' + identity.did}>
      {loading && <LinearProgress />}
      <ListItemAvatar>
        <Avatar src={identity.picture} />
      </ListItemAvatar>
      <ListItemText primary={identity.name} secondary={identity.nickname} />
    </ListItemLink>
  )
}

export default IdentityListItemLink