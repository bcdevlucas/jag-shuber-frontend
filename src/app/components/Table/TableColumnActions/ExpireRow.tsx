import moment from 'moment';

import * as React from 'react';
import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { TableColumnActionProps } from './index';

const ExpireRow = ({ model, onClick, fields, index , showComponent = false }: TableColumnActionProps) => {
    if (!showComponent) return null;
    const handleClick = () => {
        const row: any = fields.get(index);
        if (row.hasOwnProperty('isExpired')) {
            row.isExpired = true;
            row.expiryDate = moment(Date.now()).toISOString();
        }

        fields.remove(index);
        fields.insert(index, row);

        if (onClick && model) onClick(model);
    };

    return (
        <OverlayTrigger overlay={(<Tooltip>Expire</Tooltip>)} placement={'left'}>
            <Button bsStyle="warning" onClick={handleClick}>
                <Glyphicon glyph="time" />
            </Button>
        </OverlayTrigger>
    );
};

export default ExpireRow;
