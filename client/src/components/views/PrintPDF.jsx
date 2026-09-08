import React, { forwardRef } from 'react';

const PrintableComponent = forwardRef(({ printContent }, ref) => (

<div ref={ref}>
  <div>
    <span>Hello Smeet</span>
  </div>
  <table style={{ width: '100%' }} >
      <tbody>
      <td>
      <tr style={{ fontSize: '12px', fontWeight: 'bold',display:"flex" }}>
        <td>
          • Invoice - #6775471

        </td>
      </tr>
      </td>
      </tbody>
    </table>
</div>



));

export default PrintableComponent;
