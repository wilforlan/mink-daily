import styled from 'styled-components'

export const StyledButton = styled.button`
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #357abd;
  }

  &:active {
    background-color: #2a5f9e;
  }
` 