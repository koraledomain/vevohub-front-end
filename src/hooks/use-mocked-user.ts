import { _mock } from 'src/_mock';

import { User } from '../auth/types';
import axiosInstance from '../utils/axios';
import { getAccountId } from '../auth/context/jwt/utils';

// TO GET THE USER FROM THE AUTHCONTEXT, YOU CAN USE

// CHANGE:
// import { useMockedUser } from 'src/hooks/use-mocked-user';
// const { user } = useMockedUser();

// TO:




// ----------------------------------------------------------------------


export async function fetchUser() {
  try {
    const response = await axiosInstance.get(`https://decorous-volcano-production.up.railway.app/users/${getAccountId()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data', error);
    return [];
  }
}

export function useMockedUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    fetchUser().then(userDataFromAPI => {
      const user: User = {
        id: getAccountId(),
        firstName: userDataFromAPI.firstName,
        lastName: userDataFromAPI.lastName,
        email: userDataFromAPI.email,
        password: 'demo1234',
        photoURL: _mock.image.avatar(24),
        phoneNumber: userDataFromAPI.phoneNumber,
        country: userDataFromAPI.country,
        address: userDataFromAPI.address,
        city: userDataFromAPI.city,
        about: userDataFromAPI.about,
        role: 'admin',
        isPublic: true,
      };
      resolve(user);
    }).catch(error => {
      console.error('Error fetching user data:', error);
      reject(error);
    });
  });
}

