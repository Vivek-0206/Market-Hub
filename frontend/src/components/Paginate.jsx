import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Paginate = ({ pages, page, category, vendor, isAdmin = false }) => {
  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => (
          <LinkContainer
            key={x + 1}
            to={
              isAdmin
                ? `/Admin/productlist/page/${x + 1}`
                : category && vendor
                  ? `/store/category/${category}/vendor/${vendor}/page/${x + 1}`
                  : category
                    ? `/store/category/${category}/page/${x + 1}`
                    : vendor
                      ? `/store/vendor/${vendor}/page/${x + 1}`
                      : `/store/page/${x + 1}`
            }
          >
            <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
    )
  );
};

export default Paginate;
