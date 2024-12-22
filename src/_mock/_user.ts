import {IUserItem} from '../types/user';
import axiosInstance from '../utils/axios';
import {getAccountId} from '../auth/context/jwt/utils';
import {candidatesResponseAPI} from "../types/candidates";

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  {value: 'active', label: 'Active'},
  {value: 'pending', label: 'Pending'},
  {value: 'banned', label: 'Banned'},
  {value: 'rejected', label: 'Rejected'},
];


export async function fetchCandidates(page: number, size: number, profiles: string[],
                                      fullNameCandidate?: string): Promise<candidatesResponseAPI> {
  try {
    // Create a params object and filter out empty or undefined values
    const params: any = {
      page,
      size,
      profiles: profiles.length > 0 ? profiles.join(',') : undefined,
    };

    if (fullNameCandidate) {
      params.fullNameCandidate = fullNameCandidate;
    }

    const response = await axiosInstance.get<candidatesResponseAPI>('https://decorous-volcano-production.up.railway.app/candidates', {params});
    return response.data;
  } catch (error) {
    console.error('Error fetching candidates', error);
    throw error;
  }
}

export const createCandidate = async (data: any) => {
  try {
    const response = await axiosInstance.post('/create/candidate', data);
    return response.data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export const updateCandidate = async (data: any) => {
  try {
    const response = await axiosInstance.post('/create/candidate', data);
    return response.data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export async function fetchRoles(): Promise<string[]> {
  try {
    const response = await axiosInstance.get('https://decorous-volcano-production.up.railway.app/candidates/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching data', error);
    return [];
  }
}

export function transformApiDataToUserItems(apiData: IUserItem[] = []) {
  if (!apiData || apiData.length === 0) {
    console.log("apiData is undefined or empty:", apiData);
    return [];
  }

  return apiData.map(apiUser => ({
    id: apiUser.id.toString(),
    first_name: `${apiUser.first_name ?? ''}`.trim(),
    last_name: `${apiUser.last_name ?? ''}`.trim(),
    profile: apiUser.profile || 'Default Role',
    financial_expectations: apiUser.financial_expectations || '0',
    has_gdpr: false, // Default value, you can update this based on actual data
    interview_feedback: null, // Default value, you can update this based on actual data
    trello_id: null, // Default value, you can update this based on actual data
    linkedin_link: apiUser.linkedin_link || '',
    trello_description: {
      linkedinLink: '', // Default value, update based on actual data if available
      beautifiedDescription: '', // Default value, update based on actual data if available
    },
    contacts: [], // Default value, assuming contacts is an empty array by default
  }));
}


export const fetchUserById = async (id: string): Promise<IUserItem> => {
  try {
    const response = await axiosInstance.get(`https://decorous-volcano-production.up.railway.app/candidates/${id}`);
    const apiUser = response.data;

    return {
      id: apiUser.id.toString(),
      first_name: apiUser.first_name || 'First Name',
      last_name: apiUser.last_name || 'Last name ',
      profile: apiUser.profile || 'Default Role',
      financial_expectations: apiUser.financialExpectations || '0',
      has_gdpr: false,
      interview_feedback: apiUser.interview_feedback || 'test',
      trello_description: {
        linkedinLink: apiUser.trello_description?.linkedinLink || '',  // Ensure to get it from the correct path
        beautifiedDescription: apiUser.trello_description?.beautifiedDescription || ''  // Ensure to get it from the correct path
      },
      contacts: apiUser.contacts?.map((contact: any) => ({
        id: contact.id.toString(),
        city: contact.city || 'Unknown City',
        country: contact.country || 'Unknown Country',
        email: contact.email || 'no-email@example.com',
        address: contact.address || 'No Address',
        phone: contact.phone || 'No Phone',
      })) || [],
      linkedin_link: apiUser.linkedin_link || '',
      trello_id: ''
    };
  } catch (error) {
    console.error('Error fetching user by ID', error);
    throw error;
  }
};


// Assuming you have a baseURL for your API
// const baseURL = 'https://api.example.com/';

// Function to update user data via API
const updateUser = async (userData: any) => {

  try {
    // Make a PATCH request to update user data

    console.log('User data to update:', userData);

    const response = await axiosInstance.patch(`https://decorous-volcano-production.up.railway.app/users/${getAccountId()}`, userData);

    // Check if the request was successful
    if (response.status === 200) {
      // Data was updated successfully
      console.log('User data updated:', response.data);
    } else {
      // Handle unsuccessful response
      throw new Error('Failed to update user data');
    }
  } catch (error) {
    // Handle any errors
    console.error('Error updating user data:', error.message);
    throw error;
  }
};


export const resetForgottenUserPasswordByEmail = async (email: string) => {

  try {

    const response = await axiosInstance.post(`https://decorous-volcano-production.up.railway.app/initiate-password-reset`, {email});

    // Check if the request was successful
    if (response.status === 200) {
      // Data was updated successfully
      console.log('User data updated:', response.data);
    } else {
      // Handle unsuccessful response
      throw new Error(`No user found with email: ${email}`);
    }
  } catch (error) {
    // Handle any errors
    console.error('No user found with email:', error.message);
    throw error;
  }
};

export const updateUserCredentials = async (data: any) => {

  try {

    const response = await axiosInstance.post(`https://decorous-volcano-production.up.railway.app/update-password`, data);

    // Check if the request was successful
    if (response.status === 200) {
      // Data was updated successfully
      console.log('User data updated:', response.data);
    } else {
      // Handle unsuccessful response
      throw new Error(`No user found with email: ${data}`);
    }
  } catch (error) {
    // Handle any errors
    console.error('No user found with email:', error.message);
    throw error;
  }
};


export default updateUser;
