import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../../components/Message';
import Loader from '../../../components/Loader';
import { useGetOrdersQuery } from '../../../slices/orderSlice';
import { formattedDateTime } from '../../../utils/utils';
import { toast } from 'react-toastify';
import {
  useDeliverOrderMutation,
  useCancelOrderMutation
} from '../../../slices/orderSlice';


const OrderListScreen = () => {
  const { data: orders, refetch, isLoading, error } = useGetOrdersQuery();

  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation();

  const deliverOrderHandler = async (orderId) => {
    try {
      await deliverOrder(orderId).unwrap();
      refetch();
      toast.success(`Order: ${orderId} is marked as delivered`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.data?.message || error.data ||
        'An error occurred. Please try again.'
      );
    }
  }

  const cancelOrderHandler = async (orderId) => {
    try {
      await cancelOrder(orderId).unwrap();
      refetch();
      toast.success(`Order: ${orderId} is marked as cancelled`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.data?.message || error.data ||
        'An error occurred. Please try again.'
      );
    }
  }

  if (loadingDeliver || loadingCancel) {
    return <Loader />;
  }



  return (
    <>
      <h1>Orders</h1>
      {loadingDeliver && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>CANCELLED</th>
              <th>DETAILS</th>
              <th>Mark as Delivered</th>
              <th>Mark as Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user.profile.clientName}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    formattedDateTime(order.paidAt)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    formattedDateTime(order.deliveredAt)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  {
                    order.isDelivered ? (
                      <p>
                        Order is Delivered
                      </p>
                    ) : order.isCancelled ? (
                      formattedDateTime(order.cancelledAt)
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )
                  }
                </td>
                <td>
                  <LinkContainer to={`/orders/${order._id}`}>
                    <Button variant='dark' className='btn-sm'>
                      Details
                    </Button>
                  </LinkContainer>
                </td>
                <td>
                  {
                    order.isDelivered ? (
                      <Button
                        variant='light'
                        className='btn-sm'
                        disabled
                      >
                        Delivered
                      </Button>
                    ) : order.isCancelled ? (
                      <Button
                        variant='light'
                        className='btn-sm'
                        disabled
                      >
                        Cancelled
                      </Button>
                    ) : (
                      <Button
                        variant='success'
                        className='btn-sm'
                        onClick={() => deliverOrderHandler(order._id)}
                      >
                        Mark as Delivered
                      </Button>
                    )
                  }
                </td>
                <td>
                  {
                    order.isDelivered ? (
                      <Button
                        variant='light'
                        className='btn-sm'
                        disabled
                      >
                        Order is Delivered
                      </Button>
                    ) : order.isCancelled ? (
                      <Button
                        variant='light'
                        className='btn-sm'
                        disabled
                      >
                        Cancelled
                      </Button>
                    ) : (
                      <Button
                        variant='success'
                        className='btn-sm'
                        onClick={() => cancelOrderHandler(order._id)}
                      >
                        Mark as Cancelled
                      </Button>
                    )
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;
