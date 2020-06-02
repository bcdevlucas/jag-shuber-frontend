import React from 'react';
import moment from 'moment';
import {
    Button,
    ListGroup,
    ListGroupItem,
    Glyphicon
} from 'react-bootstrap';
import {
    Field,
    FieldArray,
    InjectedFormProps
} from 'redux-form';
import Form from './FormElements/Form';
import * as Validators from '../infrastructure/Validators';
import CourtAssignmentSelector from '../containers/AssignmentCourtTypeSelector';
import DaysOfWeekChecklist from './FormElements/DaysOfWeekChecklist';
import JailRolesSelector from '../containers/AssignmentJailRoleSelector';
import RunSelector from '../containers/AssignmentRunSelector';
import NumberSpinner from './FormElements/NumberSpinner';
import OtherAssignmentTypeSelector from '../containers/AssignmentOtherTypeSelector';
import {
    WORK_SECTIONS,
    TimeType,
    WorkSectionCode,
    DaysOfWeek,
    Assignment,
    IdType,
    AssignmentDuty,
    DutyRecurrence
} from '../api';
import TimeSliderField from './FormElements/TimeSliderField';
import { getWorkSectionColour, isCourtAssignment } from '../api/utils';
import * as TimeUtils from '../infrastructure/TimeRangeUtils';
import { ConfirmationModal } from './ConfirmationModal';
import SelectorField from './FormElements/SelectorField';
import { COURT_ASSIGNMENT_ROOM, COURT_ASSIGNMENT_ROLE, DateType, CourtAssignment, JailAssignment, EscortAssignment, OtherAssignment } from '../api/Api';

export class OtherFields extends React.PureComponent {
    render() {
        return (
            <div>
                <Field
                    name="otherAssignId"
                    label="Assignment"
                    component={
                        (p) => <SelectorField
                            {...p}
                            SelectorComponent={
                                (sp) => <OtherAssignmentTypeSelector {...sp} label="Assignment"/>}
                        />}
                    validate={[Validators.required]}
                />
            </div>
        );
    }
}

export class EscortsFields extends React.PureComponent {
    render() {
        return (
            <div>
                <Field
                    name="escortRunId"
                    component={(p) => <SelectorField
                        {...p}
                        SelectorComponent={
                            (sp) => <RunSelector {...sp} label="Assignment"/>}
                    />}
                    label="Assignment"
                    validate={[Validators.required]}
                />
            </div>
        );
    }
}

export class JailFields extends React.PureComponent {
    render() {
        return (
            <div>
                <Field
                    name="jailRoleId"
                    component={(p) => <SelectorField
                        {...p}
                        SelectorComponent={
                            (sp) => <JailRolesSelector {...sp} label="Assignment" />}
                    />}
                    label="Assignment"
                    validate={[Validators.required]}
                />
            </div>
        );
    }
}

export class CourtSecurityFields extends React.PureComponent {
    // static method here to be called from the parser and to form values
    static isCourtAssignmentIdCourtroom(courtAssignmentId: string = '') {
        return courtAssignmentId.includes(`${COURT_ASSIGNMENT_ROOM}:`);
    }

    static courtAssignmentIdToAssignmentValue(courtAssignmentId: string = '') {
        const match = courtAssignmentId.match(/:(.*)/);
        return match ? match[1] : undefined;
    }

    static assignmentValueToCourtAssignmentId(value: string = '', isCourtRoom: boolean) {
        return isCourtRoom ? `${COURT_ASSIGNMENT_ROOM}:${value}` : `${COURT_ASSIGNMENT_ROLE}:${value}`;
    }

    render() {
        return (
            <div>
                <Field
                    name="courtAssignmentId"
                    component={(p) => <SelectorField
                        {...p}
                        SelectorComponent={
                            (sp) => <CourtAssignmentSelector {...sp} label="Assignment"/>}
                    />}
                    label="Assignment"
                    validate={[Validators.required]}
                />
            </div>
        );
    }
}

interface RecurrenceProps {
    id?: IdType;
    daysBitmap: DaysOfWeek;
    timeRange: {
        startTime: TimeType;
        endTime: TimeType;
    };
}
class RecurrenceFieldArray extends FieldArray<RecurrenceProps | Partial<AssignmentDuty>> {
}

export interface AssignmentFormProps {
    handleSubmit?: () => void;
    onSubmitSuccess?: () => void;
    onRemoveDutyRecurrence?: (id: IdType) => void;
    isDefaultTemplate?: boolean;
    minTime?: TimeType;
    maxTime?: TimeType;
    workSectionId?: WorkSectionCode;
    allowDelete?: boolean;
    allowEdit?: boolean;
    startDateTime?: DateType;
    endDateTime?: DateType;
    assignments: Assignment[];
}

interface AssignmentFormData {
    workSectionId: WorkSectionCode;
    dutyRecurrences: DutyRecurrenceFormData[];
    jailRoleId?: string;
    courtAssignmentId?: string;
    otherAssignmentTypeId?: string;
    escortRunId?: string;
}

interface DutyRecurrenceFormData {
    id?: string;
    daysBitmap: DaysOfWeek;
    sheriffsRequired: number;
    timeRange: {
        startTime: TimeType;
        endTime: TimeType;
    };
}

const TIME_FORMAT = 'HH:mm:ss';

// tslint:disable-next-line:max-line-length
export default class AssignmentForm extends React.Component<AssignmentFormProps & InjectedFormProps<any, AssignmentFormProps>> {

    static parseAssignmentFromValues(values: any): Assignment {
        const { dutyRecurrences = [], courtAssignmentId, ...rest } = (values as AssignmentFormData);
        let assignment: any = { ...rest };

        assignment.dutyRecurrences = dutyRecurrences.map((element) => ({
            id: element.id,
            daysBitmap: element.daysBitmap,
            startTime: moment(element.timeRange.startTime).format(TIME_FORMAT),
            endTime: moment(element.timeRange.endTime).format(TIME_FORMAT),
            sheriffsRequired: element.sheriffsRequired
        }));

        const courtAssignment = CourtSecurityFields.courtAssignmentIdToAssignmentValue(courtAssignmentId);
        const isCourtroomAssignment = CourtSecurityFields.isCourtAssignmentIdCourtroom(courtAssignmentId);
        if (isCourtroomAssignment) {
            assignment.courtroomId = courtAssignment;
        } else {
            assignment.courtRoleId = courtAssignment;
        }

        return assignment as Assignment;
    }

    static assignmentToFormValues({ dutyRecurrences = [], ...rest }: Assignment): any {
        return {
            ...rest,
            dutyRecurrences: dutyRecurrences.map(({ startTime, endTime, ...restRecurrence }) => ({
                ...restRecurrence,
                timeRange: {
                    startTime: moment(startTime, TIME_FORMAT).toISOString(),
                    endTime: moment(endTime, TIME_FORMAT).toISOString()
                }
            })),
            courtAssignmentId: isCourtAssignment(rest)
                    ? (rest.courtroomId
                        ? CourtSecurityFields.assignmentValueToCourtAssignmentId(rest.courtroomId, true)
                        : CourtSecurityFields.assignmentValueToCourtAssignmentId(rest.courtRoleId, false))
                    : undefined
        };
    }

    static duplicateCheck(values: any, assignments: Assignment[]) {
        const {
            jailRoleId,
            // jailRoleCode,
            courtAssignmentId,
            escortRunId,
            // otherAssignCode,
            otherAssignId,
            workSectionId,
            id
        } = values;

        const courtAssignment = CourtSecurityFields.courtAssignmentIdToAssignmentValue(courtAssignmentId);
        const isCourtroomAssignment = CourtSecurityFields.isCourtAssignmentIdCourtroom(courtAssignmentId);
        const courtroomId = (isCourtroomAssignment ? courtAssignment : undefined);
        const courtRoleId = (!isCourtroomAssignment ? courtAssignment : undefined);

        let assignment: Assignment | undefined;
        let workSectionAssignments = assignments!.filter(a => a.workSectionId === workSectionId && a.id !== id);
        switch (workSectionId)
        {
            case 'COURTS':
            {
                assignment = workSectionAssignments.find((a) => (a as CourtAssignment).courtRoleId === courtRoleId && (a as CourtAssignment).courtroomId == courtroomId);
                assignment = assignment || { courtroomId, courtRoleId, workSectionId: 'COURTS' } as CourtAssignment;
                break;
            }
            case 'JAIL':
            {
                assignment = workSectionAssignments.find((a) => (a as JailAssignment).jailRoleId === jailRoleId);
                assignment = assignment || { jailRoleId, workSectionId: 'JAIL' } as JailAssignment;
                break;
            }
            case 'ESCORTS':
            {
                assignment = workSectionAssignments.find((a) => (a as EscortAssignment).escortRunId === escortRunId);
                assignment = assignment || { escortRunId, workSectionId: 'ESCORTS' } as EscortAssignment;
                break;
            }
            default:
            {
                assignment = workSectionAssignments.find((a) => (a as OtherAssignment).otherAssignId === otherAssignId);
                assignment = assignment || { otherAssignId, workSectionId: 'OTHER' } as OtherAssignment;
            }
        }
        return !!assignment.id;
    }
    static validateForm(values: any) {
        const errors: any = {};
        const { dutyRecurrences = [] }: { dutyRecurrences: DutyRecurrence[] } = values;
        if (dutyRecurrences.length > 0) {
            const validateSheriffsRequired = Validators.validateWith(
                Validators.required,
                Validators.max10,
                Validators.min1);
            const recurrenceArrayErrors = dutyRecurrences.map(dr => (
                {
                    sheriffsRequired: validateSheriffsRequired(dr.sheriffsRequired)
                }
            ));
            if (recurrenceArrayErrors.length) {
                errors.dutyRecurrences = recurrenceArrayErrors;
            }
        }

        return errors;
    }

    private renderHeading() {
        let heading = 'Other';
        if (this.props.initialValues && this.props.initialValues) {
            const { workSectionId = 'OTHER' } = this.props.initialValues;

            switch (WORK_SECTIONS[workSectionId]) {
                case WORK_SECTIONS.COURTS:
                    heading = 'Courts';
                    break;
                case WORK_SECTIONS.JAIL:
                    heading = 'Jail';
                    break;
                case WORK_SECTIONS.ESCORTS:
                    heading = 'Escorts';
                    break;
                case WORK_SECTIONS.OTHER:
                    heading = 'Other';
                    break;
                default:
                    heading = '';
            }
        }

        return <h1>{heading}</h1>;
    }

    private renderWorkSectionFields() {
        let returnFields;
        if (this.props.initialValues && this.props.initialValues) {
            const { workSectionId = 'OTHER' } = this.props.initialValues;

            switch (WORK_SECTIONS[workSectionId]) {
                case WORK_SECTIONS.COURTS:
                    returnFields = <CourtSecurityFields />;
                    break;
                case WORK_SECTIONS.JAIL:
                    returnFields = <JailFields />;
                    break;
                case WORK_SECTIONS.ESCORTS:
                    returnFields = <EscortsFields />;
                    break;
                case WORK_SECTIONS.OTHER:
                    returnFields = <OtherFields />;
                    break;
                default:
                    returnFields = '';
                    break;
            }
        } else {
            returnFields = '';
        }
        return returnFields;
    }

    private renderAssignmentTemplateFields() {
        const {
            isDefaultTemplate,
            minTime = TimeUtils.getDefaultTimePickerMinTime().toISOString(),
            maxTime = TimeUtils.getDefaultTimePickerMaxTime().toISOString(),
            workSectionId = 'OTHER',
            onRemoveDutyRecurrence,
            allowDelete = true,
            allowEdit = true
        } = this.props;
        if (isDefaultTemplate) {
            return (
                <div>
                    <strong>Days &amp; Times</strong>
                    <RecurrenceFieldArray
                        name="dutyRecurrences"
                        component={(p) => {
                            const { fields } = p;
                            function handleRemoveDutyRecurrence(index: number) {
                                const dId = fields.get(index).id;
                                if (dId) {
                                    if (onRemoveDutyRecurrence) {
                                        onRemoveDutyRecurrence(dId);
                                    }
                                }
                                fields.remove(index);
                            }
                            return (
                                <ListGroup >
                                    {fields.map((recurrenceInfoFieldName, index) => {
                                        return (
                                            <ListGroupItem key={index}>
                                                {allowDelete && (
                                                    <div className="pull-right">
                                                        <ConfirmationModal
                                                            title="Delete Duty Recurrence"
                                                            message={
                                                                <p style={{ fontSize: 14 }}>
                                                                      <b>Delete</b> this duty recurrence?
                                                                </p>}
                                                            actionBtnLabel={<Glyphicon glyph="trash" />}
                                                            actionBtnStyle="danger"
                                                            confirmBtnLabel="Delete"
                                                            confirmBtnStyle="danger"
                                                            onConfirm={() => {
                                                                handleRemoveDutyRecurrence(index);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <Field
                                                    name={`${recurrenceInfoFieldName}.daysBitmap`}
                                                    component={DaysOfWeekChecklist as any}
                                                    label="Days"
                                                />
                                                <Field
                                                    name={`${recurrenceInfoFieldName}.timeRange`}
                                                    component={(p) => <TimeSliderField
                                                        {...p}
                                                        minTime={minTime}
                                                        maxTime={maxTime}
                                                        timeIncrement={15}
                                                        color={getWorkSectionColour(workSectionId)}
                                                    />}
                                                    label="Time Range"
                                                />
                                                <br />
                                                <Field
                                                    name={`${recurrenceInfoFieldName}.sheriffsRequired`}
                                                    component={
                                                        (p) => <NumberSpinner
                                                            {...p}
                                                            maxValue={10}
                                                        />
                                                    }
                                                    label="Number of Sheriffs Required"
                                                />
                                            </ListGroupItem>
                                        );
                                    }
                                    )}
                                    <br />
                                    {allowEdit && (
                                        <Button
                                            onClick={() => fields.push({
                                                daysBitmap: DaysOfWeek.Weekdays,
                                                sheriffsRequired: 1,
                                                timeRange: TimeUtils.getDefaultTimeRange()
                                            })}
                                        >
                                            <Glyphicon glyph="plus" />
                                        </Button>
                                    )}
                                </ListGroup>
                            );
                        }}
                    />
                </div>
            );
        }
        return '';
    }

    render() {
        return (
            <Form {...this.props}>
                {this.renderHeading()}
                {this.renderWorkSectionFields()}
                {this.renderAssignmentTemplateFields()}
            </Form>
        );
    }
}
