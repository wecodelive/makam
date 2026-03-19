import React from 'react'

const OrderCard = ({
    image,
    orderTitle,
    orderColour,
    orderSize,
    orderNo,
    orderCost
}) => {
  return (
    <article className='flex gap-x-5 items-center'>
        <img src={image} alt="order Image" className="" />
        <div className="flex flex-col gap-y-10">
            <div className='flex flex-col'>
                <div className="flex justify-between">
                    <span className="">{orderTitle}</span>
                    <span className="underline">change</span>
                </div>
                <span>{`${orderColour}/${orderSize}`}</span>
            </div>
            <div className="flex justify-between">
                <span className="">{`(${orderNo})`}</span>
                <span className="underline">{`$ ${orderCost}`}</span>
            </div>
        </div>
    </article>
  )
}

export default OrderCard