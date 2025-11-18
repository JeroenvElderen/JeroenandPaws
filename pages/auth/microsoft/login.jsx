import loginHandler from '../../../api/auth/microsoft/login';

const MicrosoftLoginPage = () => null;

export async function getServerSideProps(context) {
  await loginHandler(context.req, context.res);

  if (context.res.writableEnded) {
    return { props: {} };
  }

  return {
    redirect: {
      destination: '/booking',
      permanent: false,
    },
  };
}

export default MicrosoftLoginPage;