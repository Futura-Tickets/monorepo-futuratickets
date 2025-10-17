'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Providers
import { useAuth } from '@/contexts/auth-context';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordModal } from '@/components/change-password-modal';
import { Input } from '@/components/ui/input';

// Services
import { getUserProfile, updateUserProfile } from '@/app/shared/services/services';

// Interfaces
import type { NewUserInfo, UserData } from '@/app/shared/interface';

interface UserProfileProps {
  showMessage: (type: string, text: string) => void;
}

const initialFormState = { name: '', lastName: '', email: '', phone: '', birthdate: '' };

export default function UserProfile({ showMessage }: UserProfileProps) {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formFields, setFormFields] = useState(initialFormState);
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });
  
  const [phoneValue, setPhoneValue] = useState('');
  
  const displayMessage = (type: string, text: string) => {
    showMessage(type, text);
  };

  const formatDateToComponents = (dateString?: string) => {
    if (!dateString) return { day: '', month: '', year: '' };
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? { day: '', month: '', year: '' } : 
      { day: String(d.getDate()), month: String(d.getMonth() + 1), year: String(d.getFullYear()) };
  };

  const resetFormFields = (data: UserData | null) => {
    setFormFields({
      name: data?.name || '',
      lastName: data?.lastName || '',
      email: data?.email || '',
      phone: data?.phone || '',
      birthdate: data?.birthdate || '',
    });
    
    setPhoneValue(data?.phone || '');
    
    setBirthDate(data ? formatDateToComponents(data.birthdate) : { day: '', month: '', year: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormFields(prev => ({ ...prev, [id]: value }));
  };
  
  const handlePhoneChange = (value: string | undefined) => {
    const phoneNumber = value || '';
    setPhoneValue(phoneNumber);
    setFormFields(prev => ({ ...prev, phone: phoneNumber }));
  };

  useEffect(() => {
    if (editing && !isLoading) {
      const selectElement = document.querySelector('.PhoneInputCountrySelect') as HTMLSelectElement;
      
      if (selectElement) {
        selectElement.style.direction = 'ltr';
        
        const applySelectStyles = () => {
          const options = selectElement.querySelectorAll('option');
          options.forEach(option => {
            option.style.backgroundColor = '#001917';
            option.style.color = 'white';
            option.style.padding = '8px';
            option.style.textAlign = 'left';
            option.style.direction = 'ltr';
          });
        };
        
        selectElement.addEventListener('mousedown', applySelectStyles);
        selectElement.addEventListener('focus', applySelectStyles);
        
        return () => {
          selectElement.removeEventListener('mousedown', applySelectStyles);
          selectElement.removeEventListener('focus', applySelectStyles);
        };
      }
    }
  }, [editing, isLoading]);
  
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const { id, value } = e.target;
    const field = id.replace('birth', '').toLowerCase();
    
    setBirthDate(prev => {
      const updated = { ...prev, [field]: value.replace(/[^0-9]/g, '') };
      let { day, month, year } = updated;
      
      let [d, m, y] = [parseInt(day || '0'), parseInt(month || '0'), parseInt(year || '0')];
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 150;
      
      if (field === 'year' && year.length === 4) {
        if (y < minYear) {
          y = minYear;
          updated.year = minYear.toString();
        } else if (y > currentYear) {
          y = currentYear;
          updated.year = currentYear.toString();
        }
      }
      
      if (field === 'month' && month.length > 0) {
        if (m > 12) {
          m = 12;
          updated.month = '12';
        } else if (m < 1 && month.length === 2) {
          m = 1;
          updated.month = '01';
        }
      }
      
      if ((field === 'day' && day.length > 0) || (field === 'month' && month.length > 0 && day.length > 0)) {
        let maxDaysInMonth = 31;
        
        if (m > 0 && m <= 12) {
          if (m === 2) {
            const isLeapYear = (year.length === 4) && 
              ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0);
            maxDaysInMonth = isLeapYear ? 29 : 28;
          } else if ([4, 6, 9, 11].includes(m)) {
            maxDaysInMonth = 30;
          }
        }
        
        if (d > maxDaysInMonth) {
          d = maxDaysInMonth;
          updated.day = maxDaysInMonth.toString();
        } else if (d < 1 && day.length === 2) {
          d = 1;
          updated.day = '01';
        }
      }
      
      const hasValidFormat = day && month && year?.length === 4 && d > 0 && d <= 31 && m > 0 && m <= 12 && y >= minYear && y <= currentYear;
      
      if (hasValidFormat && y === currentYear) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        if (m > currentMonth || (m === currentMonth && d > currentDay)) {
          setFormFields(prev => ({ ...prev, birthdate: '' }));
          return updated;
        }
      }
      
      if (hasValidFormat) {
        const date = new Date(y, m - 1, d);
        const isValidDate = date.getDate() === d && date.getMonth() === m - 1;
        
        if (isValidDate) {
          setFormFields(prev => ({ 
            ...prev, 
            birthdate: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
          }));
        } else {
          setFormFields(prev => ({ ...prev, birthdate: '' }));
        }
      } else {
        setFormFields(prev => ({ ...prev, birthdate: '' }));
      }
      
      return updated;
    });
  };
  
  const loadUserProfile = async () => {
    setIsLoading(true);

    try {
      const user = await getUserProfile();
      
      setUserData(user);
      resetFormFields(user);

    } catch (error) {
      displayMessage('error', 'Failed to load your data');
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    
    const { name, lastName, email, phone, birthdate } = formFields;
    
    if (!name || !email || !lastName || !phone || !birthdate) return displayMessage('error', 'Please fill in all fields, including a valid date of birth');

    try {
      setIsLoading(true);
      
      const newUserInfo: NewUserInfo = {
        name,
        lastName,
        email,
        phone,
        birthdate,
      };
      
      const updatedData = await updateUserProfile(newUserInfo);
      
      setUserData(updatedData);
      if (updatedData) {
        resetFormFields(updatedData); 
      }
      displayMessage('success', 'Data updated successfully');
      setEditing(false);
    } catch (error) {
      displayMessage('error', 'Error updating profile'); 
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { isLoggedIn, isAuthLoading } = useAuth();
  
  useEffect(() => {
    isLoggedIn && !isAuthLoading && loadUserProfile();
    !isAuthLoading && !isLoggedIn && router.push('/login');
  }, [isAuthLoading, isLoggedIn]);

  if (isLoading && !userData) {
    return (
      <div className='bg-white/5 p-6 rounded-lg border border-white/10 flex justify-center items-center h-60'>
        <p className='text-white/70'>Loading profile information...</p>
      </div>
    );
  }

  return (
    <Card className='bg-white/5 border-white/10'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold text-futura-teal'>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor="name" className='block text-sm text-white/80 mb-1'>First Name</label>
            <Input id="name" type='text' className='w-full p-2 rounded bg-white/5 border-white/10 text-white' value={formFields.name} onChange={handleInputChange} disabled={!editing || isLoading} placeholder='John' />
          </div>
          <div>
            <label htmlFor="lastName" className='block text-sm text-white/80 mb-1'>Last Name</label>
            <Input id="lastName" type='text' className='w-full p-2 rounded bg-white/5 border-white/10 text-white' value={formFields.lastName} onChange={handleInputChange} disabled={!editing || isLoading} placeholder='Doe' />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4'> 
          <div>
            <label htmlFor="email" className='block text-sm text-white/80 mb-1'>Email</label>
            <Input id="email" type='email' className='w-full p-2 rounded bg-white/5 border-white/10 text-white' value={formFields.email} onChange={handleInputChange} disabled={!editing || isLoading} placeholder='john@example.com' />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-white/80 mb-1'>Date of Birth</label>
            <div className='grid grid-cols-3 gap-2'>
              <Input 
                id="birthDay" 
                type='text' 
                placeholder='DD' 
                maxLength={2} 
                className='w-full p-2 rounded bg-white/5 border-white/10 text-white text-center' 
                value={birthDate.day} 
                onChange={handleBirthdateChange} 
                disabled={!editing || isLoading} 
              />
              <Input 
                id="birthMonth" 
                type='text' 
                placeholder='MM' 
                maxLength={2} 
                className='w-full p-2 rounded bg-white/5 border-white/10 text-white text-center' 
                value={birthDate.month} 
                onChange={handleBirthdateChange} 
                disabled={!editing || isLoading} 
              />
              <Input 
                id="birthYear" 
                type='text' 
                placeholder='YYYY' 
                maxLength={4} 
                className='w-full p-2 rounded bg-white/5 border-white/10 text-white text-center' 
                value={birthDate.year} 
                onChange={handleBirthdateChange} 
                disabled={!editing || isLoading} 
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className='block text-sm text-white/80 mb-1'>Phone Number</label>
            <div className="phone-input-container custom-phone-dropdown">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="ES"
                value={phoneValue}
                onChange={handlePhoneChange}
                disabled={!editing || isLoading}
                inputClassName="bg-transparent text-white"
                containerClassName={`${!editing || isLoading ? 'PhoneInput--disabled' : ''}`}
                countrySelectProps={{
                  style: { 
                    textAlign: 'left',
                    direction: 'ltr'
                  },
                  className: 'custom-country-select'
                }}
              />
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          {editing ? (
            <>
              <Button onClick={() => { setEditing(false); resetFormFields(userData); }} className='px-4 py-2 bg-white/10 rounded text-white hover:bg-white/20' disabled={isLoading}>Cancel</Button>
              <Button onClick={handleSave} className='px-4 py-2 bg-futura-teal text-black rounded hover:bg-teal-400' disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)} className='px-4 py-2 bg-futura-teal text-black rounded hover:bg-teal-400' disabled={isLoading}>Edit Profile</Button>
          )}
        </div>
        <div className='mt-6 pt-6 border-t border-white/10'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-futura-teal'>Security</h3>
              <p className='text-sm text-white/70'>Update your password</p>
            </div>
            <ChangePasswordModal showMessage={displayMessage} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}