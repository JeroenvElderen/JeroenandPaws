import Home from '../src/views/Home/Home';

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 3600,
    }
}

const HomePage = () => <Home />;

export default HomePage;
