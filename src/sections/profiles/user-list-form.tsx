import React, {useState, useCallback} from 'react';

import {Button} from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {IUserItem} from "../../types/user";
import TrelloInfo from "./profile-trello-tab";

import Iconify from "../../components/iconify";
import UserNewEditForm from "./user-new-edit-form";
import AccountChangePassword from "../account/account-change-password";

type Props = {
  currentUser?: IUserItem;
};

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24}/>,
    component: UserNewEditForm,
  },
  {
    value: 'trelloInfo',
    label: 'Trello Info',
    icon: <Iconify icon="solar:bell-bing-bold" width={24}/>,
    component: TrelloInfo,
  },
  {
    value: 'recruiterFeedback',
    label: 'Recruiter Feedback',
    icon: <Iconify icon="ic:round-vpn-key" width={24}/>,
    component: AccountChangePassword,
  },
];

export default function ListUserForms({currentUser}: Props) {
  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container>
      <Typography variant="h6" gutterBottom/>
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: {xs: 3, md: 5},
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value}/>
        ))}
      </Tabs>

      {currentTab === 'general' && (
        <UserNewEditForm currentUser={currentUser}/>
      )}

      {currentTab === 'trelloInfo' && (
        <TrelloInfo
          info={currentUser ?? {
            id: '',
            first_name: '',
            last_name: '',
            profile: '',
            financial_expectations: '',
            has_gdpr: false,
            interview_feedback: '',
            trello_description: {
              linkedinLink: '',
              beautifiedDescription: ''
            },
            linkedin_link: '',
            trello_id: '',
            contacts: []
          }}// Provide actual posts if available
        />
      )}

      {currentTab === 'recruiterFeedback' && (
        <Button/>
      )}
    </Container>
  );
}
