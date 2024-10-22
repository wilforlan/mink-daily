import React, { type FC } from 'react';
import { Button } from '@headlessui/react';
import { getImage } from '@/src/lib/helpers';

interface Props {
  onClick: () => void;
}
const GoogleLogin: FC<Props> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>
      <div className="google_btn_ff_container">
        <span className="googleImgCanvas">
          <img src={getImage('google')} alt="google logo" />
        </span>
        Login with Google
      </div>
    </Button>
  );
};

export default GoogleLogin;
