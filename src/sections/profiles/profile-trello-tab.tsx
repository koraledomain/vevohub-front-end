import React, {useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import {IUserItem} from 'src/types/user';

import BeautifiedText from "../../components/text/beautifyText";

// ----------------------------------------------------------------------

type Props = {
  info: IUserItem;
};

export default function TrelloInfo({info}: Props) {
  const [beautifiedDescription, setBeautifiedText] = useState<string>('');

  useEffect(() => {
    if (info && info.trello_description?.beautifiedDescription) {
      setBeautifiedText(info.trello_description.beautifiedDescription);
    }
  }, [info]);

  const renderAbout = (
    <Card>
      <CardHeader title="About"/>

      <Stack spacing={2} sx={{p: 3}}>
        <Stack direction="row" spacing={2}>
          <Iconify icon="mingcute:location-fill" width={24}/>
          <Box sx={{typography: 'body2'}}>
            Location:
            {info.contacts
              .filter(contact => contact.country) // Filter contacts that have a country
              .map((contact, index) => (
                <span key={index}>{contact.country}</span> // Display each country
              ))
            }
          </Box>
        </Stack>

        <Stack direction="row" sx={{typography: 'body2'}}>
          <Iconify icon="fluent:mail-24-filled" width={24} sx={{mr: 2}}/>
          {info.contacts.filter(contactEmail => contactEmail.email).map((contact, index) => (
            <span key={index}>{contact.email}</span> // Display each country
          ))
          }
        </Stack>

        <Stack direction="row" sx={{typography: 'body2'}}>
          <Iconify icon="ic:round-link" width={24} sx={{mr: 2}}/>
          <Link href={info.linkedin_link} target="_blank" rel="noopener">
            LinkedIn Profile
          </Link>
        </Stack>
      </Stack>
    </Card>
  );

  const renderCommentCard = (
    <Card sx={{mt: 3}}>
      <CardHeader title="Interview Notes"/>

      <Box sx={{p: 3}}>
        <Typography variant="body2" component="p">
          <BeautifiedText description={beautifiedDescription || 'No interview notes available.'}
                          sx={{color: 'text.primary', mt: 2}}/>

        </Typography>
      </Box>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Stack spacing={3}>
          {renderAbout}
        </Stack>
      </Grid>

      <Grid xs={12} md={8}>
        <Stack spacing={3}>
          {renderCommentCard}
        </Stack>
      </Grid>
    </Grid>
  );
}
