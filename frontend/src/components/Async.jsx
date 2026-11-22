import { Loading, ErrorBox } from './ui';
export default ({ q, children }) => q.loading ? <Loading /> : q.error ? <ErrorBox msg={q.error} retry={q.reload} /> : children;
