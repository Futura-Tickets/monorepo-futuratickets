'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// COMPONENTS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// INTERFACES
import type { ContactFormData, ContactProps } from '@/app/shared/interface';

export function Contact({ onSubmit, isProcessing, isFormLocked, initialData }: ContactProps & { initialData?: ContactFormData | null }) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [phoneValue, setPhoneValue] = useState('');
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Efecto para inicializar los datos cuando están disponibles
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPhoneValue(initialData.phone || '');
      setBirthDate({
        day: initialData.day || '',
        month: initialData.month || '',
        year: initialData.year || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    const phoneNumber = value || '';
    setPhoneValue(phoneNumber);
    setFormData(prev => ({ ...prev, phone: phoneNumber }));
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.replace('birth', '').toLowerCase();
    
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
          return updated;
        }
      }
      
      if (hasValidFormat) {
        const date = new Date(y, m - 1, d);
        const isValidDate = date.getDate() === d && date.getMonth() === m - 1;
        
        if (isValidDate) {
          const birthdate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          setFormData(prev => ({ 
            ...prev,
            day: d.toString(),
            month: m.toString(),
            year: y.toString(),
            birthdate: birthdate
          }));
        }
      }
      
      return updated;
    });
  };

  useEffect(() => {
    if (!isFormLocked) {
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
  }, [isFormLocked]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = (): boolean => {
    const { firstName, lastName, email, phone } = formData;
    const { day, month, year } = birthDate;
    
    return (
      firstName?.trim() !== '' &&
      lastName?.trim() !== '' &&
      email?.trim() !== '' &&
      isValidEmail(email || '') &&
      day !== '' &&
      month !== '' &&
      year !== '' &&
      phone?.trim() !== ''
    );
  };

  return (
    <Card className='bg-white/5 border-white/10 mb-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShoppingBag className='h-5 w-5 text-futura-teal' />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First Name *</Label>
            <Input
              id='firstName'
              name='firstName'
              placeholder='John'
              className='bg-white/5 border-white/10'
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isFormLocked}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last Name *</Label>
            <Input
              id='lastName'
              name='lastName'
              placeholder='Doe'
              className='bg-white/5 border-white/10'
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isFormLocked}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email *</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='john@example.com'
            className={`bg-white/5 border-white/10 ${
              formData.email && !isValidEmail(formData.email) ? 'border-red-500' : ''
            }`}
            value={formData.email}
            onChange={handleInputChange}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            disabled={isFormLocked}
          />
          {formData.email && !isValidEmail(formData.email) && (
            <span className="text-red-500 text-xs">Please enter a valid email address</span>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Date of Birth *</Label>
            <div className='grid grid-cols-3 gap-2'>
              <Input
                name='birthDay'
                placeholder='DD'
                maxLength={2}
                className='bg-white/5 border-white/10 text-center'
                value={birthDate.day}
                onChange={handleBirthdateChange}
                required
                disabled={isFormLocked}
              />
              <Input
                name='birthMonth'
                placeholder='MM'
                maxLength={2}
                className='bg-white/5 border-white/10 text-center'
                value={birthDate.month}
                onChange={handleBirthdateChange}
                required
                disabled={isFormLocked}
              />
              <Input
                name='birthYear'
                placeholder='YYYY'
                maxLength={4}
                className='bg-white/5 border-white/10 text-center'
                value={birthDate.year}
                onChange={handleBirthdateChange}
                required
                disabled={isFormLocked}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number *</Label>
            <div className="phone-input-container custom-phone-dropdown">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="ES"
                value={phoneValue}
                onChange={handlePhoneChange}
                disabled={isFormLocked}
                inputClassName="bg-transparent text-white"
                containerClassName={`${isFormLocked ? 'PhoneInput--disabled' : ''}`}
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
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Link href='/cart'>
          <Button 
            variant='outline' 
            className='border-white/10 hover:bg-white/5 gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Cart
          </Button>
        </Link>
        {!isFormLocked && (
          <Button
            type='submit'
            className='bg-futura-teal hover:bg-futura-teal/90 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isProcessing || !isFormValid()}
            onClick={() => onSubmit(formData)}
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}