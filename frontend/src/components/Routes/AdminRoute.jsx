import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  if (!userInfo) {
    return <Navigate to='/' replace />;
  }

  const isAdmin = userInfo && userInfo.userType === 'Admin';
  return isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to='/login' replace />
  );
};
export default AdminRoute;
