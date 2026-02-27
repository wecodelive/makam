import React from 'react'
import { useNavigate } from 'react-router';
import { Input } from '../../components/Inputs';
import Button from '../../components/Buttons';
import OrderCard from './components/orderCard';
import { MoveLeft } from 'lucide-react';

const Checkout = () => {
    const orders = [
        {
            image: '/placeHolder.jpg',
            orderTitle: 'Test shirt',
            orderColour: 'Black',
            orderSize: 'L',
            orderNo: '1',
            orderCost: '10'
        },
        {

        }
    ]
    const handleSubmit = () => {}
  return (
    <>
        <MoveLeft />
        <div>
            <h1 className="">CHECKOUT</h1>
            <div className="flex">
                <span>INFORMATION</span>
                <span>SHIPPING</span>
                <span>PAYMENT</span>
            </div>
        </div>
        <section className="flex flex-col gap-y-10 lg:flex-row">
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>CONTACT INFO</legend>
                    <Input
                    label=""
                    placeholder="Email"
                    id="checkoutMail"
                    type="email"
                    inputVariant="h-[56px] w-full lg:w-1/3"
                    placeVariant=""
                    />
                    <Input
                    label=""
                    placeholder="Phone"
                    id="checkoutPhone"
                    type="tel"
                    inputVariant="h-[56px] w-full lg:w-1/3"
                    placeVariant=""
                    />
                </fieldset>

                <fieldset>
                    <legend>SHIPPING ADDRESS</legend>
                    <div className="flex w-full userName">
                        <Input
                        label=""
                        placeholder="First Name"
                        id="checkoutFirstName"
                        type="text"
                        inputVariant="h-[56px] w-full lg:w-1/3"
                        placeVariant=""
                        />
                        <Input
                        label=""
                        placeholder="Last Name"
                        id="checkoutLastName"
                        type="text"
                        inputVariant="h-[56px] w-full lg:w-1/3"
                        placeVariant=""
                        />
                    </div>
                    <Input
                    label=""
                    placeholder="Country"
                    id="checkoutCountry"
                    type="text"
                    inputVariant="h-[56px] w-full lg:w-1/3"
                    placeVariant=""
                    />
                    <Input
                    label=""
                    placeholder="State / Region"
                    id="checkoutRegion"
                    type="text"
                    inputVariant="h-[56px] w-full lg:w-1/3"
                    placeVariant=""
                    />
                    <Input
                    label=""
                    placeholder="Address"
                    id="checkoutLastName"
                    type="text"
                    inputVariant="h-[56px] w-full lg:w-1/3"
                    placeVariant=""
                    />
                    <div className="flex w-full userLocation">
                        <Input
                        label=""
                        placeholder="City"
                        id="checkoutCity"
                        type="text"
                        inputVariant="h-[56px] w-full lg:w-1/3"
                        placeVariant=""
                        />
                        <Input
                        label=""
                        placeholder="Postal Code"
                        id="checkoutPostal"
                        type="text"
                        inputVariant="h-[56px] w-full lg:w-1/3"
                        placeVariant=""
                        />
                    </div>
                </fieldset>

                <Button
                value={'SHIPPING'}
                showArrow ={true} />                
            </form>
            <article className="userOrder">
                <h2>YOUR ORDER</h2>
                <div className="order border-b">
                    {orders.map(order => {
                        <OrderCard 
                        image = {order.image}
                        orderTitle = {order.orderTitle}
                        orderColour = {order.orderColour}
                        orderSize = {order.orderSize}
                        orderNo = {order.orderNo}
                        orderCost={order.orderCost}
                        />
                    })}
                </div>
                <div className="border-b flex flex-col">
                    <div className="justify-between flex">
                        <span className="">Subtotal</span>
                        <span className=''>${180.00}</span>
                    </div>
                    <div className="justify-between flex">
                        <span className="">Shipping</span>
                        <span className=''>{'Calculated at next step'}</span>
                    </div>
                </div>
                <div className="justify-between flex">
                    <span className="">Total</span>
                    <span className=''>{180.00}</span>
                </div>

            </article>
        </section>
    </>
    
  )
}

export default Checkout