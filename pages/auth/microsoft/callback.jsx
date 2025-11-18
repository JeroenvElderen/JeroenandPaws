import callbackHandler from '../../../api/auth/microsoft/callback';

const MicrosoftCallbackPage = () => null;

export async function getServerSideProps(context) {
  await callbackHandler(context.req, context.res);

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

export default MicrosoftCallbackPage;