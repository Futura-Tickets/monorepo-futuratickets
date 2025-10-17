'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ANTD
import { DatePicker, InputNumber, Upload, UploadProps, Tag, TimePicker, Switch, Select } from 'antd';
import dayjs from 'dayjs';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import TextArea from 'antd/es/input/TextArea';
import { CalendarOutlined, CameraOutlined, CloseOutlined, DeleteOutlined, EnvironmentOutlined, ExportOutlined, FileTextOutlined, InfoCircleOutlined, PictureOutlined, PlusOutlined, QuestionCircleOutlined, SaveOutlined, SwapOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';

// COMPONENTS
import Error from '@/shared/Error/Error';
import EventActions from '../EventActions/EventActions';
import GoBack from '@/shared/GoBack/GoBack';
import Loader from '@/shared/Loader/Loader';
import Modal from 'antd/es/modal/Modal';

// SERVICES
import { deleteEvent, editEvent, getEvent } from '@/shared/services';

// INTERFACES
import { Artist, EditEvent, Event as IEvent, TicketLot, TicketType } from '@/shared/interfaces';

// STYLES
import './EventInfo.scss';

// CONSTANTS
const EVENT_ERROR = 'There was an error loading your Event';
const EVENT_DELETE_ERROR = 'There was an error deleting your Event';

const { Dragger } = Upload;
const { CheckableTag } = Tag;

const dateFormat = 'DD-MM-YYYY';
const timeFormat = 'HH:mm';

const availableGenres = [
  'rock', 'pop', 'electronic', 'jazz', 'classical', 
  'hip-hop', 'trap', 'reggaeton', 'latin', 'alternative', 'rap'
];


const countries = [
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'DK', label: 'Denmark' },
  { value: 'SE', label: 'Sweden' },
  { value: 'FI', label: 'Finland' },
  { value: 'NO', label: 'Norway' },
  { value: 'IE', label: 'Ireland' },
  { value: 'GR', label: 'Greece' }
];

export default function EventInfo() {

  const pathname = usePathname();
  const router = useRouter();

  const [event, setEventState] = useState<IEvent>();
  const [error, setError] = useState<boolean>();
  const [loader, setLoader] = useState<boolean>(true);
  const [editLoader, setEditLoader] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>(EVENT_ERROR);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formChanged, setFormChanged] = useState<boolean>(false);

  const [eventRemoveModal, setEventRemoveModal] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>('media');
  
  const [eventFileName, setEventFileName] = useState<string>();
  const [ticketFileName, setTicketFileName] = useState<string>();

  const [isTicketLot, setIsTicketLot] = useState<boolean>(false);
  const [isResale, setIsResale] = useState<boolean>(true);

  const [form] = Form.useForm();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const goTo = (route: string): void => {
    window.open(`${process.env.NEXT_PUBLIC_MARKET_PLACE}/events/${route}`, '_blank');
  };

  const setEvent = async (eventId: string): Promise<void> => {
    try {

      setLoader(true);

      const event = await getEvent(eventId);
      setEventState(event);

      setLoader(false);

    } catch (error) {
      setErrorMsg(EVENT_ERROR);
      setError(true);
      setLoader(false);
    }
  };

  const removeEvent = async (event: string): Promise<void> => {
    try {

      setLoader(true);

      await deleteEvent(event);

      navigateTo('/events');

      setLoader(false);

    } catch (error) {
      setErrorMsg(EVENT_DELETE_ERROR);
      setError(true);
      setLoader(false);
    }
  };

  const editEventForm = async (): Promise<void> => {

    setEditLoader(true);

    const launchDateValue = form.getFieldValue('launchDate');
    const launchDate = launchDateValue ? new Date(launchDateValue) : undefined;
    
    const startDate = new Date(form.getFieldValue('startDate'));
    const startTime = new Date(form.getFieldValue('startTime'));
    const endDate = new Date(form.getFieldValue('endDate'));
    const endTime = new Date(form.getFieldValue('endTime'));
    
    const combinedStartDate = new Date(
      startDate.getFullYear(), 
      startDate.getMonth(), 
      startDate.getDate(),
      startTime.getHours(), 
      startTime.getMinutes()
    );
    
    const combinedEndDate = new Date(
      endDate.getFullYear(), 
      endDate.getMonth(), 
      endDate.getDate(),
      endTime.getHours(), 
      endTime.getMinutes()
    );

    const updateEvent: EditEvent = {
        name: form.getFieldValue('name'),
        description: form.getFieldValue('description'),
        genres: form.getFieldValue('genres'),
        artists: form.getFieldValue('artists'),
        capacity: form.getFieldValue('capacity'),
        maxQuantity: form.getFieldValue('maxQuantity'),
        availableTickets: form.getFieldValue('availableTickets'),
        tickets: isTicketLot ? [] : form.getFieldValue('tickets'),
        ticketLots: isTicketLot ? form.getFieldValue('tickets') : [],
        resale: {
          isResale: isResale,
          isActive: event?.resale.isActive!,
          minPrice: Number(form.getFieldValue('minPrice')),
          maxPrice: Number(form.getFieldValue('maxPrice')),
          royalty: Number(form.getFieldValue('royalty'))
        },
        location: {
          venue: form.getFieldValue('venue'),
          address: form.getFieldValue('address'),
          city: form.getFieldValue('city'),
          country: form.getFieldValue('country'),
          postalCode: form.getFieldValue('postalCode'),
          lat: form.getFieldValue('lat'),
          lon: form.getFieldValue('lon')
        },
        dateTime: {
          launchDate,
          startDate: combinedStartDate,
          endDate: combinedEndDate,
        },
        image: form.getFieldValue('image'),
        ticketImage: form.getFieldValue('ticketImage'),
        conditions: form.getFieldValue('conditions'),
        faqs: form.getFieldValue('faqs')
    };

    try {

      const updatedEvent = await editEvent(event!._id, updateEvent);

      
      if (updatedEvent) {
        
        setEventState(updatedEvent);
        
        const normalizedGenres = updatedEvent.genres.map(genre =>  typeof genre === 'string' ? genre.toLowerCase() : genre);
        setSelectedGenres(normalizedGenres);
        
      }

      setEditLoader(false);

    } catch (error) {
      console.log(error);
      setEditLoader(false);
    }
  };

  const navigateTo = (route: string): void => {
    setLoader(true);
    router.push(route);
  };

  const handleEventRemoveCancel = (): void => {
    setEventRemoveModal(false);
  };

  const setInitialTickets = (tickets: TicketType[]) => {
    if (tickets.length > 0) return tickets;
    return [{ type: undefined, amount: undefined, price: undefined }];
  };

  const setInitialTicketLots = (ticketLots: TicketLot[]) => {
    if (ticketLots.length > 0) return ticketLots;
    return [{
      type: undefined,
      ticketLotItems: [
          { amount: undefined, price: undefined }
      ]
    }];
  };

  const initEventForm = (event: IEvent): void => {

    const normalizedGenres = event.genres.map(genre => typeof genre === 'string' ? genre.toLowerCase() : genre);
    setSelectedGenres(normalizedGenres);
    
    form.setFieldsValue({
      name: event.name,
      description: event.description,
      genres: normalizedGenres, 
      url: event.url,
      image: event.image,
      ticketImage: event.ticketImage,
      venue: event.location.venue,
      artists: event.artists,
      address: event.location.address,
      city: event.location.city,
      postalCode: event.location.postalCode,
      country: event.location.country,
      lat: event.location.lat,
      lon: event.location.lon,
      conditions: event.conditions && event.conditions.length ? event.conditions : [{ title: '', description: '' }],
      faqs: event.faqs && event.faqs.length ? event.faqs : [{ title: '', description: '' }],
      capacity: event.capacity,
      maxQuantity: event.maxQuantity,
      availableTickets: event.availableTickets,
      launchDate: event.dateTime.launchDate ? dayjs(event.dateTime.launchDate) : null,
      startDate: dayjs(event.dateTime.startDate),
      startTime: dayjs(event.dateTime.startDate),
      endDate: dayjs(event.dateTime.endDate),
      endTime: dayjs(event.dateTime.endDate),
      isResale: event.resale.isResale,
      royalty: event.resale.royalty,
      minPrice: event.resale.minPrice,
      maxPrice: event.resale.maxPrice,
      isBlockchain: event.isBlockchain,
      tickets: setInitialTickets(event.tickets),
      ticketLots: setInitialTicketLots(event.ticketLots)
    });

    setTicketFileName(event.ticketImage);
    setEventFileName(event.image);
    setIsTicketLot(event.tickets.length > 0 ? false : true);
    setIsResale(event.resale.isResale);

  };

  const scrollTo = (section: string): void => {
    const element = document.getElementById(section);
    element && window.scrollTo({ top: element.getBoundingClientRect().y + window.scrollY - 190 });
    element && setActiveLink(section);
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    const nextSelectedGenres = checked ? [...selectedGenres, genre] : selectedGenres.filter(g => g !== genre);
    
    setSelectedGenres(nextSelectedGenres);
    form.setFieldValue('genres', nextSelectedGenres);
    
    setFormChanged(true);
  };

  const hasFormChanged = (values: any) => {
    setFormChanged(true);
  };

  const eventImageProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: `${process.env.NEXT_PUBLIC_FUTURA}/api/upload`,
    onChange(info) {

      const { status } = info.file;
      
      if (status !== 'uploading') {
        console.log('uploading ...');
      }
      
      if (status === 'done') {
        console.log('uploaded!');
        setEventFileName(info.file.response.name);
        form.setFieldValue('image', info.file.response.name);
      } else if (status === 'error') {
        console.log('error uploading!');
      }
    },
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};

  const ticketImageProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: `${process.env.NEXT_PUBLIC_FUTURA}/api/upload`,
    onChange(info) {

      const { status } = info.file;
      
      if (status !== 'uploading') console.log('uploading ...');
      
      if (status === 'done') {
        console.log('uploaded!');
        setTicketFileName(info.file.response.name);
        form.setFieldValue('ticketImage', info.file.response.name);
      } else if (status === 'error') {
        console.log('error uploading!');
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const ticketLotChange = (isTicketLot: boolean): void => {
    setIsTicketLot(isTicketLot);
  };

  useEffect(() => {
    const eventId = pathname.substring(pathname.indexOf('/', 1) + 1, pathname.length - 5);
    eventId && setEvent(eventId);
  }, []);

  useEffect(() => {
    event && initEventForm(event);
  }, [event]);

  useEffect(() => {
    !editMode && formChanged && (form.getFieldsError().filter(({ errors }) => errors.length).length == 0) && editEventForm();
  }, [editMode]);

  if (loader) return <Loader />;
  if (error) return <Error errorMsg={errorMsg} />;

  return (
    <>
      <div className='event-info-container'>
        <div className='event-info-header'>
          <GoBack route={`/events/${event?._id}`} />
          <h1>{event?.name} <ExportOutlined onClick={() => goTo(event?.url!)}/></h1>
          <EventActions
            event={event!}
            actions={{
              launch: true,
              access: false,
              resale: false,
              notifications: false,
              info: true,
              edit: true,
              delete: true,
            }}
            setEventRemoveModal={setEventRemoveModal}
            isEditMode={editMode}
            setEditMode={setEditMode}
          />
        </div>
        <div className='event-info-content'>
          <div className='event-info-menu'>
            <ul>
                <li className={activeLink == "media" ? "active" : ""} onClick={() => scrollTo('media')}>Media</li>
                <li className={activeLink == "information" ? "active" : ""} onClick={() => scrollTo('information')}>General Information</li>
                <li className={activeLink == "location" ? "active" : ""} onClick={() => scrollTo('location')}>Location</li>
                <li className={activeLink == "dateTime" ? "active" : ""} onClick={() => scrollTo('dateTime')}>Date and Time</li>
                <li className={activeLink == "ticketing" ? "active" : ""} onClick={() => scrollTo('ticketing')}>Ticketing</li>
                <li className={activeLink == "resale" ? "active" : ""} onClick={() => scrollTo('resale')}>Resale</li>
                <li className={activeLink == "conditions" ? "active" : ""} onClick={() => scrollTo('conditions')}>Conditions</li>
                <li className={activeLink == 'faqs' ? 'active' : ''} onClick={() => scrollTo('faqs')}>FAQs</li>
            </ul>
          </div>
          <div className={`event-info-form-container ${editMode ? 'edit-mode' : ''}`}>
            <Form form={form} layout='vertical' className='add-collection-content' onFieldsChange={hasFormChanged}>
              <div className='add-collection-fields' id='media'>
                <h2>
                  <PictureOutlined /> Media
                </h2>
                <div className='add-collection-images'>
                  {!editMode && (
                    <div className='add-collection-image'>
                      <Form.Item label='Ticket Image (300px x 200px)' name='image' rules={[{ required: true }]}>
                        <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${event?.ticketImage}`}/>
                      </Form.Item>
                    </div>
                  )}
                  {!editMode && (
                    <div className='add-collection-image'>
                      <Form.Item label='Event Image (1200px x 360px)' name='image' rules={[{ required: true }]}>
                        <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${event?.image}`}/>
                      </Form.Item>
                    </div>
                  )}
                  {ticketFileName && editMode && (
                      <div className="add-collection-image">
                          <label>Ticket Image (300px x 200px)</label>
                          <span className="delete-image" onClick={() => setTicketFileName(undefined)}>
                              <CloseOutlined />
                          </span>
                          <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${ticketFileName}`}/>
                      </div>
                  )}
                  {eventFileName && editMode && (
                      <div className="add-collection-image">
                          <label>Event Image (1200px x 360px)</label>
                          <span className="delete-image" onClick={() => setEventFileName(undefined)}>
                              <CloseOutlined />
                          </span>
                          <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${eventFileName}`}/>
                      </div>
                  )}
                  {!ticketFileName && editMode && (
                    <div className="add-collection-image">
                      <Form.Item label="Ticket Image (300px x 200px)" name="ticketImage" rules={[{ required: true }]}>
                        <Dragger showUploadList={false} {...ticketImageProps}>
                          <CameraOutlined /> Upload a Picture
                        </Dragger>
                      </Form.Item>
                    </div>
                  )}
                  {!eventFileName && editMode && (
                    <div className="add-collection-image">
                      <Form.Item label="Event Image (1200px x 360px)" name="image" rules={[{ required: true }]}>
                        <Dragger showUploadList={false} {...eventImageProps}>
                          <CameraOutlined /> Upload a Picture
                        </Dragger>
                      </Form.Item>
                    </div>
                  )}
                </div>
              </div>
              <div className='add-collection-fields' id='information'>
                <h2>
                  <InfoCircleOutlined /> General Information
                </h2>
                <Form.Item
                  label='Name of the event'
                  name='name'
                  rules={[
                    { required: true, message: 'The event name is required!' },
                  ]}
                >
                  <Input size='large'/>
                </Form.Item>
                <Form.Item
                  label='Description'
                  name='description'
                  rules={[
                    { required: true, message: 'The description is required!' },
                  ]}
                >
                  <TextArea rows={4} size='large' />
                </Form.Item>
                <Form.Item
                  label='genres'
                  name='genres'
                  rules={[
                    { required: true, message: 'At least one genre is required!' },
                  ]}
                >
                  <div className="tag-container">
                    {[...availableGenres].filter(genre => !editMode ? selectedGenres.includes(genre.toLowerCase()) : true).sort((a, b) => {
                      const aSelected = selectedGenres.includes(a.toLowerCase());
                      const bSelected = selectedGenres.includes(b.toLowerCase());
                      
                      if (aSelected && !bSelected) return -1;
                      if (!aSelected && bSelected) return 1;

                      return 0;
                    }).map(genre => (
                      <CheckableTag key={genre} checked={selectedGenres.includes(genre.toLowerCase())} onChange={checked => handleGenreChange(genre.toLowerCase(), checked)}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </CheckableTag>
                    ))}
                  </div>
                </Form.Item>
                <Form.Item label='Event url' name='url'>
                  <Input size='large' disabled={editMode ? true : false}/>
                </Form.Item>
              </div>
              <div className='add-collection-fields' id='artists'>
                <h2>
                  <TeamOutlined /> Artists
                </h2>
                <div className="artists-container">
                  <Form.List name="artists">
                      {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div className="artist-content" key={key}>
                                  <Form.Item {...restField} label="Artist" name={[name, 'name']} rules={[{ required: true, message: "The artist name is required!" }]}>
                                      <Input size="large"/>
                                  </Form.Item>
                                  {(fields.length > 1 && editMode) && (
                                      <div className="remove-btn">
                                          <CloseOutlined onClick={() => remove(name)}/>
                                      </div>
                                  )}
                                </div>
                            ))}
                            {editMode && (
                              <Form.Item>
                                  <Button size="large" onClick={() => add()}>
                                      Add Artist
                                  </Button>
                              </Form.Item>
                            )}
                          </>
                      )}
                  </Form.List>
                </div>
              </div>
              <div className='add-collection-fields' id='location'>
                <h2>
                  <EnvironmentOutlined /> Location
                </h2>
                <Form.Item
                  label='Venue'
                  name='venue'
                  rules={[
                    { required: true, message: 'The venue is required!' },
                  ]}
                >
                  <Input size='large' />
                </Form.Item>
                <Form.Item
                  label='Address'
                  name='address'
                  rules={[
                    { required: true, message: 'The address is required!' },
                  ]}
                >
                  <Input size='large' />
                </Form.Item>
                <Form.Item
                  label='Postal Code'
                  name='postalCode'
                  rules={[
                    { required: true, message: 'The postal code is required!' },
                  ]}
                >
                  <Input size='large' />
                </Form.Item>
                <Form.Item
                  label='City'
                  name='city'
                  rules={[{ required: true, message: 'The city is required!' }]}
                >
                  <Input size='large' />
                </Form.Item>
                <Form.Item
                  label='Country'
                  name='country'
                  rules={[
                    { required: true, message: 'The country is required!' },
                  ]}
                >
                  <Select 
                    size='large' 
                    placeholder="Select a country"
                    showSearch
                    disabled={!editMode}
                  >
                    {countries.map(country => (
                      <Select.Option key={country.value} value={country.value}>
                        {country.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label='Latitude'
                  name='lat'
                  rules={[
                    { required: true, message: 'The latitude is required!' },
                  ]}
                >
                  <Input size='large' />
                </Form.Item>
                <Form.Item
                  label='Longitude'
                  name='lon'
                  rules={[
                    { required: true, message: 'The longitude is required!' },
                  ]}
                >
                  <Input size='large' />
                </Form.Item>
              </div>
              <div className="add-collection-fields" id="dateTime">
                <h2><CalendarOutlined /> Date and Time</h2>
                {event?.dateTime.launchDate && (
                  <div className="start-end-dates">
                    <Form.Item label="Launch Date" name="launchDate">
                      <DatePicker size="large" format={dateFormat} placeholder="Launch Date" style={{ width: '100%' }}/>
                    </Form.Item>
                  </div>
                )}
                <div className="start-end-dates">
                  <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: "Start date is required!" }]}>
                    <DatePicker size="large" format={dateFormat} placeholder="Start Date" style={{ width: '100%' }}/>
                  </Form.Item>
                  <Form.Item label="Start Time" name="startTime" rules={[{ required: true, message: "Start time is required!" }]}>
                    <TimePicker size="large" format={timeFormat} style={{ width: '100%' }} minuteStep={15}/>
                  </Form.Item>
                </div>
                <div className="start-end-dates">
                  <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: "End date is required!" }]}>
                    <DatePicker size="large" format={dateFormat} placeholder="End Date" style={{ width: '100%' }}/>
                  </Form.Item>
                  <Form.Item label="End Time" name="endTime" rules={[{ required: true, message: "End time is required!" }]}>
                    <TimePicker size="large" format={timeFormat} style={{ width: '100%' }} minuteStep={15}/>
                  </Form.Item>
                </div>
              </div>
              <div className='add-collection-fields' id='ticketing'>
                <h2>
                  <TagsOutlined /> Ticketing
                </h2>
                {editMode && (
                  <Form.Item label="Enable Ticket Lot">
                      <Switch onChange={ticketLotChange} value={isTicketLot}/>
                      {isTicketLot && <p><InfoCircleOutlined /> Los tramos se utilizan para incentivar la compra anticipada, crear expectativa y gestionar la demanda, dividiendo las entradas en fases con precios iniciales más bajos que van aumentando a medida que se acerca la fecha del evento.</p>}
                  </Form.Item>
                )}
                <Form.Item label="Maximum tickets for sale" name="maxQuantity" rules={[{ required: true, message: "Maximum tickets for sale is required!" }]}>
                  <InputNumber controls={false} size="large"/>
                </Form.Item>
                <Form.Item label="Maximum tickets per order" name="availableTickets" rules={[{ required: true, message: "Maximum ticket quantity required!" }]}>
                  <InputNumber controls={false} size="large"/>
                </Form.Item>
                {((event!.tickets.length > 0 && !editMode) || (!isTicketLot && editMode)) && (
                  <div className='tickets-types-container'>
                    <Form.List name="tickets">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <div className='ticket-type-content' key={key}>
                              <Form.Item
                                {...restField}
                                label='Type'
                                name={[name, 'type']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The type is required!',
                                  },
                                ]}
                              >
                                <Input size='large' />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label='Amount'
                                name={[name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The capacity is required!',
                                  },
                                ]}
                              >
                                <InputNumber
                                  controls={false}
                                  size='large'
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label='Price (EUR)'
                                name={[name, 'price']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The price is required!',
                                  },
                                ]}
                              >
                                <InputNumber
                                  controls={false}
                                  size='large'
                                />
                              </Form.Item>
                              {fields.length > 1 && editMode && (
                                <div className="remove-btn">
                                  <CloseOutlined onClick={() => remove(name)}/>
                                </div>
                              )}
                            </div>
                          ))}
                          {editMode && (
                            <Form.Item>
                              <Button size="large" onClick={() => add()}>
                                Add Ticket
                              </Button>
                            </Form.Item>
                          )}
                        </>
                      )}
                    </Form.List>
                  </div>
                )}
                {((event!.ticketLots.length > 0 && !editMode) || (isTicketLot && editMode)) && (
                  <div className="tickets-lot-types-container">
                    <Form.List name="ticketLots">
                      {(fields, { add, remove }) => (
                          <>
                          {fields.map(({ key, name, ...restField }) => (
                              <div className="ticket-lot-type-content" key={key}>
                                  <div>
                                      <h3>Ticket Lot #{key + 1}</h3>
                                      <Form.Item {...restField} label="Ticket Type" name={[name, 'type']} rules={[{ required: true, message: "The type is required!" }]}>
                                          <Input size="large"/>
                                      </Form.Item>
                                      <Form.List name={[name, 'ticketLotItems']}>
                                          {(fields, { add, remove }) => (
                                              <>
                                                  {fields.map(({ key, name, ...restField }) => (
                                                      <div className="ticket-lot-item-content" key={key}>
                                                          <Form.Item {...restField} label="Amount" name={[name, 'amount']} rules={[{ required: true, message: "The capacity is required!" }]}>
                                                              <InputNumber controls={false} size="large"/>
                                                          </Form.Item>
                                                          <Form.Item {...restField} label="Price (EUR)" name={[name, 'price']} rules={[{ required: true, message: "The price is required!" }]}>
                                                              <InputNumber controls={false} size="large"/>
                                                          </Form.Item>
                                                          {fields.length > 1 && (
                                                              <div className="remove-btn">
                                                                  <CloseOutlined onClick={() => remove(name)}/>
                                                              </div>
                                                          )}
                                                      </div>
                                                  ))}
                                                  {editMode && (
                                                    <div className="add-lot">
                                                        <Form.Item>
                                                            <Button size="large" onClick={() => add()}>
                                                                <PlusOutlined /> Add Lot
                                                            </Button>
                                                        </Form.Item>
                                                    </div>
                                                  )}
                                              </>
                                          )}
                                      </Form.List>
                                  </div>
                                  {(fields.length > 1 && editMode) && (
                                      <div className="remove-btn">
                                          <CloseOutlined onClick={() => remove(name)}/>
                                      </div>
                                  )}
                              </div>
                          ))}
                          <div className="add-ticket-lot">
                              <Form.Item>
                                  <Button size="large" onClick={() => add()}>
                                      <PlusOutlined /> Add Ticket Lot
                                  </Button>
                              </Form.Item>
                          </div>
                          </>
                      )}
                    </Form.List>
                  </div>
                )}
              </div>
              <div className='add-collection-fields' id='resale'>
                <h2 className='resale'>
                  <SwapOutlined />
                  Resale
                </h2>
                <Form.Item label="Enable Resale" name="isResale">
                    <Switch 
                        checked={isResale} 
                        onChange={(checked) => setIsResale(checked)}
                        disabled={!editMode}
                    />
                </Form.Item>
                <Form.Item label='Royalty %' name='royalty'>
                  <InputNumber controls={false} size='large' disabled={!isResale} />
                </Form.Item>
                <Form.Item label='Minimum Price' name='minPrice'>
                  <InputNumber controls={false} size='large' disabled={!isResale} />
                </Form.Item>
                <Form.Item label='Maximum Price' name='maxPrice'>
                  <InputNumber controls={false} size='large' disabled={!isResale} />
                </Form.Item>
              </div>
              <div className='add-collection-fields' id='conditions'>
                <h2>
                  <FileTextOutlined /> Conditions
                </h2>
                <div className='conditions-container'>
                  <Form.List name="conditions">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div className='condition-content' key={key}>
                            <div className="condition-form-fields">
                              <Form.Item
                                {...restField}
                                label='Title'
                                name={[name, 'title']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The condition title is required!',
                                  },
                                ]}
                              >
                                <Input size='large' />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label='Description'
                                name={[name, 'description']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The condition description is required!',
                                  },
                                ]}
                              >
                                <TextArea rows={4} size='large' />
                              </Form.Item>
                            </div>
                            {fields.length > 1 && editMode && (
                              <div className="remove-btn">
                                <CloseOutlined onClick={() => remove(name)}/>
                              </div>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <Form.Item>
                            <Button size="large" onClick={() => add({ title: '', description: '' })}>
                              Add Condition
                            </Button>
                          </Form.Item>
                        )}
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
              <div className='add-collection-fields' id='faqs'>
                <h2>
                  <QuestionCircleOutlined /> FAQs
                </h2>
                <div className='faqs-container'>
                  <Form.List name="faqs">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div className='faq-content' key={key}>
                            <div className="faq-form-fields">
                              <Form.Item
                                {...restField}
                                label='Question'
                                name={[name, 'title']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The FAQ question is required!',
                                  },
                                ]}
                              >
                                <Input size='large' />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label='Answer'
                                name={[name, 'description']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'The FAQ answer is required!',
                                  },
                                ]}
                              >
                                <TextArea rows={4} size='large' />
                              </Form.Item>
                            </div>
                            {fields.length > 1 && editMode && (
                              <div className="remove-btn">
                                <CloseOutlined onClick={() => remove(name)}/>
                              </div>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <Form.Item>
                            <Button size="large" onClick={() => add({ title: '', description: '' })}>
                              Add FAQ
                            </Button>
                          </Form.Item>
                        )}
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
              {editMode && (
                <div className="add-collection-fields">
                  <Form.Item className="add-collection-actions" shouldUpdate>
                      {() => (
                        <Button className="ant-btn-primary" size="large" onClick={() => setEditMode(!editMode)} loading={editLoader}>
                          <SaveOutlined /> Save Event
                        </Button>
                      )}
                  </Form.Item>
                </div>
              )}
            </Form>
          </div>
        </div>
      </div>
      <Modal title={null} open={eventRemoveModal} onCancel={handleEventRemoveCancel} closable={true} footer={null} mask={true} centered>
        <div className='event-remove-modal-container'>
          <div className='event-remove-modal-content'>
            <h2>
              <DeleteOutlined /> Remove Event
            </h2>
            <p>
              The event <strong>"{event?.name}"</strong> will be deleted and all
              its related data.
            </p>
            <p>You will not be able to recover the information.</p>
            <div className='event-remove-modal-action'>
              <Button size='large' type='primary' onClick={() => removeEvent(event?._id!)}>
                Remove Event
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
