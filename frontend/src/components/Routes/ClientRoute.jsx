import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ClientRoute = () => {
	const { userInfo } = useSelector((state) => state.auth);

	if (!userInfo) {
		return <Navigate to='/' replace />;
	}

	const isClient = userInfo.userType === 'Client' || userInfo.userType === 'Admin';

	return isClient ? <Outlet /> : <Navigate to='/login' replace />;
};
export default ClientRoute;
