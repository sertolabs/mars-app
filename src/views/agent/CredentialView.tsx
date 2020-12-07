import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import CredentialCard from "../../components/CredentialCard";
import AppBar from "../../components/Nav/AppBar";
import { useAgent } from '../../agent'
import { UniqueVerifiableCredential } from 'daf-typeorm'
import { Grid } from "@material-ui/core";
import { VerifiableCredential } from "daf-core";


function CredentialView(props: any) {
  const { hash } = useParams<{ hash: string }>()
  const { agent } = useAgent()
  const [ loading, setLoading ] = useState(false)
  const [ credential, setCredential ] = useState<VerifiableCredential|undefined>(undefined)
  const [ credentials, setCredentials ] = useState<Array<UniqueVerifiableCredential>>([])
  useEffect(() => {
    if (agent) {
      setLoading(true)
      agent.dataStoreGetVerifiableCredential({ hash })
      .then(setCredential)
    }
  }, [agent, hash])

  useEffect(() => {
    if (agent && credential) {
      agent.dataStoreORMGetVerifiableCredentials({      
        where: [ { column: 'subject', value: [credential?.credentialSubject.id || '']}]
      })
      .then(setCredentials)
      .finally(() => setLoading(false))
    }
  }, [agent, credential])


  return (
    <Container maxWidth="sm">
      <AppBar/>
      {loading && <LinearProgress />}
      {credential && <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
            <CredentialCard credential={{hash, verifiableCredential: credential}} type='details' />
        </Grid>
        {credentials.map(credential => (
          <Grid item key={credential.hash} xs={12}>
            <CredentialCard credential={credential} type='details' />
          </Grid>
        ))}
      </Grid>}
    </Container>
  );
}

export default CredentialView;