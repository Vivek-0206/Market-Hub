import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
} from '../../slices/orderSlice';
import { formattedDate, formattedDateTime } from '../../utils/utils';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Meta from "../../components/Meta";

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const { userInfo } = useSelector((state) => state.auth);
  const isClient = userInfo.userType === 'Client'

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  // const payOrderHandler = async () => {
  //   try {
  //     await payOrder({ orderId, details: { payer: {} } });
  //     refetch();
  //     toast.success('Order is paid');
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //       error?.data?.message ||
  //       'An error occurred. Please try again.'
  //     );
  //   }
  // }

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypal.clientId,
            currency: 'CAD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPaypalScript();
        }
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success('Order is paid');
      } catch (error) {
        toast.error(
          error?.data?.message || error?.response?.data?.message || error.data ||
          'An error occurred. Please try again.'
        );
      }
    });
  }

  const onError = (error) => {
    toast.error(
      error?.data?.message || error?.response?.data?.message || error.data ||
      'An error occurred. Please try again.'
    );
  }

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error.data.message}</Message>
  ) : (
    <>
      <Meta title={`Order ${order._id}`} />
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.profile.clientName}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {formattedDate(order.deliveredAt)}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isCancelled ? (
                <Message variant='danger'>Cancelled</Message>
              ) : order.isPaid ? (
                <>
                  <Message variant='success'>
                    Paid on {formattedDateTime(order.paidAt)}
                  </Message>
                  <Message variant='success'>
                    <p>
                      Your payment ID is <strong>{order.paymentResult.id}</strong>
                    </p>
                    <p>
                      Your payment status is <strong>{order.paymentResult.status}</strong>
                    </p>
                    <p>
                      Your payment update time is <strong>{formattedDateTime(order.paymentResult.update_time)}</strong>
                    </p>
                  </Message>
                </>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )
              }
              {
                order.isPaid && order.isCancelled && (
                  <>
                    <Message variant='danger'>
                      <p>
                        Your payment ID is <strong>{order.paymentResult.id}</strong>
                      </p>
                      <p>
                        Your payment status is <strong>{order.paymentResult.status}</strong>
                      </p>
                      <p>
                        Your payment update time is <strong>{formattedDateTime(order.paymentResult.update_time)}</strong>
                      </p>

                      <p>
                        Your amount will be refunded to <strong>{order.paymentResult.email_address}</strong>
                      </p>
                    </Message>
                  </>
                )
              }
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/products/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {/* if order is not paid and if user is client show button */}
              {!order.isPaid && isClient && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      {/* <Button
                              style={{ marginBottom: '10px' }}
                              onClick={payOrderHandler}
                            >
                              Test Pay Order
                            </Button> */
                      }
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row >
    </>
  );
};

export default OrderScreen;
