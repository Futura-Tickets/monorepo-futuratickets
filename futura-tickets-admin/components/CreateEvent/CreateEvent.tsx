'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ANTD
import { DatePicker, InputNumber, TimePicker, Upload, UploadProps, Tag, Switch, Modal, Select } from 'antd';
const { CheckableTag } = Tag;
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import TextArea from 'antd/es/input/TextArea';
import { CalendarOutlined, CameraOutlined, CloseOutlined, EnvironmentOutlined, FileTextOutlined, InfoCircleOutlined, PictureOutlined, PlusOutlined, QuestionCircleOutlined, SwapOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';

// COMPONENTS
import GoBack from "@/shared/GoBack/GoBack";

// SERVICES
import { createEvent } from "@/shared/services";

// UTILS
import { cleanStringForURL } from "@/shared/utils/utils";

// INTERFACES
import { CreateEvent as ICreateEvent } from "@/shared/interfaces";

// STYLES
import "./CreateEvent.scss";

// CONSTANTS
const { Dragger } = Upload;

const dateFormat = 'DD-MM-YYYY';
const timeFormat = 'HH:mm';

const availableGenres = ['rock', 'pop', 'electronic', 'jazz', 'classical', 'hip-hop', 'trap', 'reggaeton', 'latin', 'alternative', 'rap'];

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

export default function CreateEvent() {

    const router = useRouter();
    
    const [loader, setLoader] = useState<boolean>(false);
    const [eventFileName, setEventFileName] = useState<string>();
    const [ticketFileName, setTicketFileName] = useState<string>();
    const [clientReady, setClientReady] = useState<boolean>(false);
    const [isTicketLot, setIsTicketLot] = useState<boolean>(false);
    
    const [isResale, setIsResale] = useState<boolean>(true);
    const [isBlockchain, setIsBlockchain] = useState<boolean>(true);
    const [activeLink, setActiveLink] = useState<string>("media");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [confirmModal, setConfirmModal] = useState<boolean>(false);

    const [form] = Form.useForm();

    const handleGenreChange = (genre: string, checked: boolean) => {

        const nextSelectedGenres = checked ? [...selectedGenres, genre] : selectedGenres.filter(g => g !== genre);
        
        setSelectedGenres(nextSelectedGenres);
        form.setFieldValue('genres', nextSelectedGenres);

    };

    const eventImageProps: UploadProps = {
        name: 'file',
        multiple: false,
        action: `${process.env.NEXT_PUBLIC_FUTURA_API}/upload`,
        headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        onChange(info) {
            const { status } = info.file;

            if (status === 'uploading') {
                console.log('uploading ...');
            }

            if (status === 'done') {
                console.log('uploaded!', info.file.response);
                setEventFileName(info.file.response.name);
            } else if (status === 'error') {
                console.log('error uploading!', info.file.error);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const ticketImageProps: UploadProps = {
        name: 'file',
        multiple: false,
        action: `${process.env.NEXT_PUBLIC_FUTURA_API}/upload`,
        headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        onChange(info) {
            const { status } = info.file;

            if (status === 'uploading') {
                console.log('uploading ...');
            }

            if (status === 'done') {
                console.log('uploaded!', info.file.response);
                setTicketFileName(info.file.response.name);
            } else if (status === 'error') {
                console.log('error uploading!', info.file.error);
            }
        },

        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const mintCollection = async(): Promise<void> => {

        setLoader(true);
        
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

        const event: ICreateEvent = {
            name: form.getFieldValue('name'),
            description: form.getFieldValue('description'),
            genres: form.getFieldValue('genres'),
            artists: form.getFieldValue('artists'),
            capacity: form.getFieldValue('capacity'),
            url: form.getFieldValue('url'),
            maxQuantity: form.getFieldValue('maxQuantity'),
            availableTickets: form.getFieldValue('availableTickets'),
            tickets: isTicketLot ? [] : form.getFieldValue('tickets'),
            ticketLots: isTicketLot ? form.getFieldValue('ticketLots') : [],
            resale: {
                isResale: isResale,
                isActive: false,
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
                startDate: combinedStartDate,
                endDate: combinedEndDate,
            },
            image: eventFileName!,
            ticketImage: ticketFileName!,
            conditions: form.getFieldValue('conditions'),
            faqs: form.getFieldValue('faqs')
        };

        try {

            const createdEvent = await createEvent(event);

            setLoader(false);

            router.push(`/events/${createdEvent._id}`);

        } catch (error) {
            console.log(error);
            setLoader(false);
        }
    };

    const initForm = (): void => {

        setSelectedGenres([]); 

        form.setFieldsValue({
            artists: [
                { name: undefined }
            ],
            isBlockchain: isBlockchain,
            isResale: isResale,
            isTicketLot: false,
            tickets: [
                { type: undefined, amount: undefined, price: undefined }
            ],
            ticketLots: [
                {
                    type: undefined,
                    ticketLotItems: [
                        { amount: undefined, price: undefined }
                    ]
                }
            ],
            genres: [],
            conditions: [
                { title: "", description: "" }
            ],
            faqs: [
                { title: "", description: "" }
            ]
        });
    };

    const scrollTo = (section: string): void => {
        const element = document.getElementById(section);
        element && window.scrollTo({ top: element.getBoundingClientRect().y + window.scrollY - 180 });
        element && setActiveLink(section);
    };

    const ticketLotChange = (isTicketLot: boolean): void => {
        setIsTicketLot(isTicketLot);
    };
    
    const buildEventUrl = (e: any): void => {
        const parsedUrl = cleanStringForURL(e.target.value);
        form.setFieldValue('url', `${parsedUrl}`);
    };

    const showConfirmModal = (): void => {
        setConfirmModal(true);
    };

    const handleConfirmCancel = (): void => {
        setConfirmModal(false);
    };

    const isFormValid = (): boolean => {
        const values = form.getFieldsValue();

        // Check basic required fields
        const requiredFields = ['name', 'description', 'capacity', 'venue', 'address', 'city', 'country', 'postalCode', 'startDate', 'startTime', 'endDate', 'endTime', 'maxQuantity'];

        for (const field of requiredFields) {
            if (!values[field]) return false;
        }

        // Check images (now using state instead of form values)
        if (!eventFileName) return false;
        if (!ticketFileName) return false;
        
        // Check genres
        if (!values.genres || values.genres.length === 0) return false;
        
        // Check artists
        if (!values.artists || values.artists.length === 0 || !values.artists[0]?.name) return false;
        
        // Check ticketing
        if (!isTicketLot) {
            if (!values.tickets || values.tickets.length === 0) return false;
            for (const ticket of values.tickets) {
                if (!ticket.type || !ticket.amount || !ticket.price) return false;
            }
        } else {
            if (!values.ticketLots || values.ticketLots.length === 0) return false;
            for (const lot of values.ticketLots) {
                if (!lot.type || !lot.ticketLotItems || lot.ticketLotItems.length === 0) return false;
                for (const item of lot.ticketLotItems) {
                    if (!item.amount || !item.price) return false;
                }
            }
        }
        
        // Check conditions
        if (!values.conditions || values.conditions.length === 0) return false;
        for (const condition of values.conditions) {
            if (!condition.title || !condition.description) return false;
        }
        
        // Check FAQs
        if (!values.faqs || values.faqs.length === 0) return false;
        for (const faq of values.faqs) {
            if (!faq.title || !faq.description) return false;
        }
        
        return true;
    };

    useEffect(() =>  {
        initForm();
        setClientReady(true);
    }, []);

    return (
        <>
            <div className="create-event-container">
                <div className="create-event-header">
                    <GoBack route="/events"/>
                    <h1>Create Event</h1>
                </div>
                <div className="create-event-content">
                    <div className="create-event-menu">
                        <ul>
                            <li className={activeLink == "media" ? "active" : ""} onClick={() => scrollTo('media')}>Media</li>
                            <li className={activeLink == "information" ? "active" : ""} onClick={() => scrollTo('information')}>General Information</li>
                            <li className={activeLink == "artists" ? "active" : ""} onClick={() => scrollTo('artists')}>Artists</li>
                            {/* <li className={activeLink == "blockchain" ? "active" : ""} onClick={() => scrollTo('blockchain')}>Blockchain</li> */}
                            <li className={activeLink == "location" ? "active" : ""} onClick={() => scrollTo('location')}>Location</li>
                            <li className={activeLink == "dateTime" ? "active" : ""} onClick={() => scrollTo('dateTime')}>Date and Time</li>
                            <li className={activeLink == "ticketing" ? "active" : ""} onClick={() => scrollTo('ticketing')}>Ticketing</li>
                            <li className={activeLink == "resale" ? "active" : ""} onClick={() => scrollTo('resale')}>Resale</li>
                            {/* <li className={activeLink == "refund" ? "active" : ""} onClick={() => scrollTo('refund')}>Refund</li> */}
                            <li className={activeLink == "conditions" ? "active" : ""} onClick={() => scrollTo('conditions')}>Conditions</li>
                            <li className={activeLink == "faqs" ? "active" : ""} onClick={() => scrollTo('faqs')}>FAQs</li>
                        </ul>
                    </div>
                    <div className="create-event-form-container">
                        <Form form={form} layout="vertical" className="add-collection-content">
                            <div className="add-collection-fields" id="media">
                                <h2><PictureOutlined /> Media</h2>
                                <div className="add-collection-images">
                                    {ticketFileName && (
                                        <div className="add-collection-image">
                                            <label>Ticket Image (300px x 200px)</label>
                                            <span className="delete-image" onClick={() => setTicketFileName(undefined)}>
                                                <CloseOutlined />
                                            </span>
                                            <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${ticketFileName}`}/>
                                        </div>
                                    )}
                                    {eventFileName && (
                                        <div className="add-collection-image">
                                            <label>Event Image (1200px x 360px)</label>
                                            <span className="delete-image" onClick={() => setEventFileName(undefined)}>
                                                <CloseOutlined />
                                            </span>
                                            <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${eventFileName}`}/>
                                        </div>
                                    )}
                                    {!ticketFileName && (
                                        <div className="add-collection-image">
                                            <div className="upload-label">Ticket Image (300px x 200px)</div>
                                            <Dragger showUploadList={false} {...ticketImageProps}>
                                                <CameraOutlined /> Upload a Picture
                                            </Dragger>
                                        </div>
                                    )}
                                    {!eventFileName && (
                                        <div className="add-collection-image">
                                            <div className="upload-label">Event Image (1200px x 360px)</div>
                                            <Dragger showUploadList={false} {...eventImageProps}>
                                                <CameraOutlined /> Upload a Picture
                                            </Dragger>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="add-collection-fields" id="information">
                                <h2><InfoCircleOutlined /> General Information</h2>
                                <Form.Item label="Name" name="name" rules={[{ required: true, message: "The event name is required!" }]} >
                                    <Input size="large" onChange={buildEventUrl}/>
                                </Form.Item>
                                <Form.Item label="Description" name="description" rules={[{ required: true, message: "The description is required!" }]}>
                                    <TextArea size="large"/>
                                </Form.Item>
                                <Form.Item label="Capacity" name="capacity" rules={[{ required: true, message: "The capacity is required!" }]}>
                                    <InputNumber controls={false} size="large"/>
                                </Form.Item>
                                <Form.Item label="Event URL" name="url" rules={[{ required: true, message: "Event url is required!" }]}>
                                    <Input size="large" readOnly style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}/>
                                </Form.Item>
                                <Form.Item
                                    label='Géneros'
                                    name='genres'
                                    rules={[
                                        { required: true, message: 'Al menos un género es requerido!' },
                                    ]}
                                >
                                    <div className="tag-container">
                                        {availableGenres.map(genre => (
                                            <CheckableTag
                                                key={genre}
                                                checked={selectedGenres.includes(genre)}
                                                onChange={checked => handleGenreChange(genre, checked)}
                                            >
                                                {genre.charAt(0).toUpperCase() + genre.slice(1)}
                                            </CheckableTag>
                                        ))}
                                    </div>
                                </Form.Item>
                            </div>
                            <div className="add-collection-fields" id="artists">
                                <h2><TeamOutlined /> Artists</h2>
                                <div className="artists-container">
                                    <Form.List name="artists">
                                        {(fields, { add, remove }) => (
                                            <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div className="artist-content" key={key}>
                                                    {/* <Form.Item className="artist-image" {...restField} label="Image (80px x 80px)" name={[name, 'image']} rules={[{ required: true, message: "The artist image is required!" }]}>
                                                        <Dragger showUploadList={false} {...ticketImageProps}>
                                                            <CameraOutlined />
                                                        </Dragger>
                                                    </Form.Item> */}
                                                    <Form.Item {...restField} label="Artist" name={[name, 'name']} rules={[{ required: true, message: "The artist name is required!" }]}>
                                                        <Input size="large"/>
                                                    </Form.Item>
                                                    {fields.length > 1 && (
                                                        <div className="remove-artist">
                                                            <CloseOutlined onClick={() => remove(name)}/>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button size="large" onClick={() => add()}>
                                                    Add Artist
                                                </Button>
                                            </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </div>
                            </div>
                            {/*
                            <div className="add-collection-fields" id="blockchain">
                                <h2>
                                    Blockchain
                                    <Form.Item name="isBlockchain">
                                        <Switch defaultChecked onChange={isBlockchainChange}/>
                                    </Form.Item>
                                </h2>
                                <p>Enable blockchain capabilities to upgrade the functionalities of your event.</p>
                                <ul>
                                    <li><CheckCircleFilled /> Ticket authenticity verification.</li>
                                    <li><CheckCircleFilled /> Ticket ownership verification.</li>
                                    <li><CheckCircleFilled /> Secure ticket transfer.</li>
                                </ul>
                            </div>
                            */}
                            <div className="add-collection-fields" id="location">
                                <h2><EnvironmentOutlined /> Location</h2>
                                <Form.Item label="Venue" name="venue" rules={[{ required: true, message: "The venue is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Address" name="address" rules={[{ required: true, message: "The address is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Postal Code" name="postalCode" rules={[{ required: true, message: "The postal code is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="City" name="city" rules={[{ required: true, message: "The city is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Country" name="country" rules={[{ required: true, message: "The country is required!" }]}>
                                    <Select size="large" placeholder="Select a country" showSearch>
                                        {countries.map(country => (
                                            <Select.Option key={country.value} value={country.value}>
                                                {country.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Latitude" name="lat" rules={[{ required: false, message: "The latitude is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                                <Form.Item label="Longitude" name="lon" rules={[{ required: false, message: "The longitude is required!" }]}>
                                    <Input size="large"/>
                                </Form.Item>
                            </div>
                            <div className="add-collection-fields" id="dateTime">
                                <h2><CalendarOutlined /> Date and Time</h2>
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
                            <div className="add-collection-fields" id="ticketing">
                                <h2><TagsOutlined /> Ticketing</h2>
                                <Form.Item label="Enable Ticket Lot">
                                    <Switch onChange={ticketLotChange} value={isTicketLot}/>
                                    {isTicketLot && <p><InfoCircleOutlined /> Los tramos se utilizan para incentivar la compra anticipada, crear expectativa y gestionar la demanda, dividiendo las entradas en fases con precios iniciales más bajos que van aumentando a medida que se acerca la fecha del evento.</p>}
                                </Form.Item>
                                <Form.Item label="Maximum quantity" name="maxQuantity" rules={[{ required: true, message: "Maximum ticket quantity required!" }]}>
                                    <InputNumber controls={false} size="large"/>
                                </Form.Item>
                                {!isTicketLot && (
                                    <div className="tickets-types-container">
                                        <Form.List name="tickets">
                                            {(fields, { add, remove }) => (
                                                <>
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <div className="ticket-type-content" key={key}>
                                                        <Form.Item {...restField} label="Ticket Type" name={[name, 'type']} rules={[{ required: true, message: "The type is required!" }]}>
                                                            <Input size="large"/>
                                                        </Form.Item>
                                                        <Form.Item {...restField} label="Amount" name={[name, 'amount']} rules={[{ required: true, message: "The capacity is required!" }]}>
                                                            <InputNumber controls={false} size="large"/>
                                                        </Form.Item>
                                                        <Form.Item {...restField} label="Price (EUR)" name={[name, 'price']} rules={[{ required: true, message: "The price is required!" }]}>
                                                            <InputNumber controls={false} size="large"/>
                                                        </Form.Item>
                                                        {fields.length > 1 && (
                                                            <div className="remove-ticket-type">
                                                                <CloseOutlined onClick={() => remove(name)}/>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <Form.Item>
                                                    <Button size="large" onClick={() => add()}>
                                                        Add Ticket
                                                    </Button>
                                                </Form.Item>
                                                </>
                                            )}
                                        </Form.List>
                                    </div>
                                )}
                                {isTicketLot && (
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
                                                                                    <div className="remove-ticket-lot">
                                                                                        <CloseOutlined onClick={() => remove(name)}/>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        <div className="add-lot">
                                                                            <Form.Item>
                                                                                <Button size="large" onClick={() => add()}>
                                                                                    <PlusOutlined /> Add Lot
                                                                                </Button>
                                                                            </Form.Item>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </Form.List>
                                                        </div>
                                                        {fields.length > 1 && (
                                                            <div className="remove-ticket-type">
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
                            {/*
                                <div className="add-collection-fields" id="refund">
                                    <h2><TagsOutlined /> Refund</h2>
                                    <Form.Item label="Penalty" name="maxQuantity" rules={[{ required: true, message: "Maximum ticket quantity required!" }]}>
                                        <InputNumber controls={false} size="large"/>
                                    </Form.Item>
                                </div>
                            */}
                            <div className="add-collection-fields" id="resale">
                                <h2 className="resale"><SwapOutlined /> Resale</h2>
                                <Form.Item label="Enable Resale" name="isResale">
                                    <Switch 
                                        checked={isResale} 
                                        onChange={(checked) => setIsResale(checked)}
                                    />
                                </Form.Item>
                                <Form.Item label="Royalty %" name="royalty">
                                    <InputNumber controls={false} size="large" disabled={!isResale}/>
                                </Form.Item>
                                <Form.Item label="Minumum Price" name="minPrice">
                                    <InputNumber controls={false} size="large" disabled={!isResale}/>
                                </Form.Item>
                                <Form.Item label="Maximum Price" name="maxPrice">
                                    <InputNumber controls={false} size="large" disabled={!isResale}/>
                                </Form.Item>
                            </div>
                            <div className="add-collection-fields" id="conditions">
                                <h2><FileTextOutlined /> Conditions</h2>
                                <div className="conditions-container">
                                    <Form.List name="conditions">
                                        {(fields, { add, remove }) => (
                                            <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div className="condition-content" key={key}>
                                                    <div className="condition-form-fields">
                                                        <Form.Item 
                                                            {...restField} 
                                                            label="Title" 
                                                            name={[name, 'title']} 
                                                            rules={[{ required: true, message: "The condition title is required!" }]}
                                                        >
                                                            <Input size="large"/>
                                                        </Form.Item>
                                                        <Form.Item 
                                                            {...restField} 
                                                            label="Description" 
                                                            name={[name, 'description']} 
                                                            rules={[{ required: true, message: "The condition description is required!" }]}
                                                        >
                                                            <TextArea rows={4} size="large"/>
                                                        </Form.Item>
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <div className="remove-condition">
                                                            <CloseOutlined onClick={() => remove(name)}/>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button size="large" onClick={() => add({ title: '', description: '' })}>
                                                    Add Condition
                                                </Button>
                                            </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </div>
                            </div>
                            <div className="add-collection-fields" id="faqs">
                                <h2><QuestionCircleOutlined /> FAQs</h2>
                                <div className="faqs-container">
                                    <Form.List name="faqs">
                                        {(fields, { add, remove }) => (
                                            <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div className="faq-content" key={key}>
                                                    <div className="faq-form-fields">
                                                        <Form.Item 
                                                            {...restField} 
                                                            label="Title" 
                                                            name={[name, 'title']} 
                                                            rules={[{ required: true, message: "La pregunta es requerida!" }]}
                                                        >
                                                            <Input size="large"/>
                                                        </Form.Item>
                                                        <Form.Item 
                                                            {...restField} 
                                                            label="Description" 
                                                            name={[name, 'description']} 
                                                            rules={[{ required: true, message: "La respuesta es requerida!" }]}
                                                        >
                                                            <TextArea rows={4} size="large"/>
                                                        </Form.Item>
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <div className="remove-faq">
                                                            <CloseOutlined onClick={() => remove(name)}/>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button size="large" onClick={() => add({ title: '', description: '' })}>
                                                    ADD FAQ
                                                </Button>
                                            </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </div>
                            </div>
                            <div className="add-collection-fields">
                                <Form.Item className="add-collection-actions" shouldUpdate>
                                    {() => (
                                        <Button className="ant-btn-primary" size="large" onClick={() => showConfirmModal()} loading={loader} disabled={!clientReady || !isFormValid() || !!form.getFieldsError().filter(({ errors }) => errors.length).length}>
                                            Create Event
                                        </Button>
                                    )}
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
            <Modal title={null} open={confirmModal} onCancel={handleConfirmCancel} closable={!loader} footer={null} mask={true} centered>
                <div className="event-confirmation-modal-container">
                    <div className="event-confirmation-modal-content">
                        <h2>Confirm event</h2>
                        <p>Are you sure you want to create this event? Once created, some fields might not be capable of being edited.</p>
                        <div className="event-confirmation-modal-actions">
                            <Button size="large" onClick={handleConfirmCancel}>Cancel</Button>
                            <Button  size="large"  type="primary" onClick={() => mintCollection()} loading={loader}>
                                Create Event
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}