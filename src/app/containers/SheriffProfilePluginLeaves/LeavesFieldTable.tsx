import * as React from 'react';
import moment from 'moment';
import {
    FieldArray, Field, FieldsProps
} from 'redux-form';
import { Leave } from '../../api/Api';
import { Table, Button, Glyphicon } from 'react-bootstrap';
import DateField from '../../components/FormElements/DateField';
import SelectorField from '../../components/FormElements/SelectorField';
import PersonalLeaveSubCodeSelector from '../PersonalLeaveSubCodeSelector';
import CancelLeaveButton from '../CancelLeaveButton';
import LeaveCancelledPopover from '../../components/LeaveCancelledPopover';
import TimePickerField from '../../components/FormElements/TimePickerField';

export interface ColumnRendererProps {
    index: number;
    fields: FieldsProps<Partial<Leave>>;
    leave: Partial<Leave>;
    fieldInstanceName: string;
}

export type ColumnRenderer = React.ComponentType<ColumnRendererProps>;

export interface LeavesFieldTableColumn {
    title: React.ReactNode;
    FormRenderer: ColumnRenderer;
    CanceledRender: ColumnRenderer;
}

export interface LeavesFieldTableProps {
    title: React.ReactNode;
    fieldName: string;
    columns: LeavesFieldTableColumn[];
}

export default class LeavesFieldTable extends React.Component<LeavesFieldTableProps>{

    static CancelColumn: LeavesFieldTableColumn = {
        title: '',
        FormRenderer: ({ fields, index, leave: { id } }) => (
            !id ?
                (
                    <Button
                        bsStyle="link"
                        onClick={() => fields.remove(index)}
                        style={{ color: '#666666' }}
                    >
                        <Glyphicon glyph="remove" />
                    </Button>
                )
                :
                <CancelLeaveButton leaveId={id} />
        ),
        CanceledRender: ({ leave }) => (
            <LeaveCancelledPopover leave={leave} />
        )
    };

    static LeaveCodeColumn: LeavesFieldTableColumn = {
        title: 'Type',
        FormRenderer: ({ fieldInstanceName }) => (
            <Field
                name={`${fieldInstanceName}.leaveTypeCode`}
                component={(p) => <SelectorField
                    {...p}
                    showLabel={false}
                    SelectorComponent={
                        (sp) =>
                            <PersonalLeaveSubCodeSelector {...sp} />}
                />}
                label="Type"
            />
        ),
        CanceledRender: ({ leave }) => (
            <span>
                {leave.leaveTypeCode}
            </span>
        )
    };

    static DateColumn(label: string, fieldName: string): LeavesFieldTableColumn {
        return {
            title: label,
            FormRenderer: ({ fieldInstanceName }) => (
                <Field
                    name={`${fieldInstanceName}.${fieldName}`}
                    component={DateField as any}
                    label={label}
                />
            ),
            CanceledRender: ({ leave }) => (
                <span>
                    {moment(leave[fieldName]).format('MMM D, YYYY')}
                </span>
            )
        };
    }

    static TimeColumn(label: string, nullTimeLabel: string, fieldName: string): LeavesFieldTableColumn {
        return {
            title: label,
            FormRenderer: ({ fieldInstanceName }) => (
                <Field
                    name={`${fieldInstanceName}.${fieldName}`}
                    component={
                        (p) =>
                            <TimePickerField
                                {...p}
                                nullTimeLabel={nullTimeLabel}
                                timeIncrement={30}
                                style={{ width: 780 }}
                            />
                    }
                    label={label}
                />
            ),
            CanceledRender: ({ leave }) => (
                <span>
                    {moment(leave[fieldName]).format('HH:mm')}
                </span>
            )
        };
    }

    render() {
        const {
            fieldName,
            title,
            columns = []
        } = this.props;
        return (
            <FieldArray<Partial<Leave>>
                name={fieldName}
                component={({ fields }) => (
                    <div>
                        {title}
                        <Table striped={true} >
                            <thead>
                                <tr>
                                    {columns.map((col, colIndex) => (
                                        <th className="text-left" key={colIndex}>{col.title}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((fieldInstanceName, index) => {
                                    const currentLeave: Partial<Leave> = fields.get(index);
                                    const { cancelDate = undefined } = currentLeave || {};
                                    return (
                                        <tr key={index}>
                                            {
                                                columns
                                                    .map((col, colIndex) => {
                                                        const Column = cancelDate != undefined
                                                            ? col.CanceledRender
                                                            : col.FormRenderer;
                                                        return (
                                                            <td key={colIndex}>
                                                                <Column
                                                                    leave={currentLeave}
                                                                    fieldInstanceName={fieldInstanceName}
                                                                    fields={fields}
                                                                    index={index}
                                                                />
                                                            </td>
                                                        );
                                                    })
                                            }
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={5}>
                                        <Button onClick={() => fields.push({} as any)}>
                                            <Glyphicon glyph="plus" />
                                        </Button>
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>
                )}
            />
        );
    }

}
