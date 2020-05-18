import React from 'react';

import {
    FormErrors
} from 'redux-form';

import { Dispatch } from 'redux';

import {
    getCourtRoles,
    createOrUpdateCourtRoles,
    deleteCourtRoles,
    expireCourtRoles,
    unexpireCourtRoles,
    selectAdminCourtRolesPluginSection,
    setAdminCourtRolesPluginSubmitErrors,
    setAdminCourtRolesPluginFilters
} from '../../modules/assignments/actions';

import {
    getAllCourtRoles,
    getAllEffectiveCourtRoles,
    findAllCourtRoles,
    findAllEffectiveCourtRoles
} from '../../modules/assignments/selectors';

import { RootState } from '../../store';

import { CourtRoleCode, IdType } from '../../api';

import {
    FormContainerBase,
    FormContainerProps,
} from '../../components/Form/FormContainer';

import DataTable, { DetailComponentProps, EmptyDetailRow } from '../../components/Table/DataTable';
import { AdminCourtRolesProps } from './AdminCourtRoles';

import RemoveRow from '../../components/TableColumnActions/RemoveRow';
import ExpireRow from '../../components/TableColumnActions/ExpireRow';
import UnexpireRow from '../../components/TableColumnActions/UnexpireRow';
import DeleteRow from '../../components/TableColumnActions/DeleteRow';

import CodeScopeSelector from '../../containers/CodeScopeSelector';
import { currentLocation as getCurrentLocation } from '../../modules/user/selectors';
import { ActionProps } from '../../components/TableColumnCell/Actions';
import { buildPluginPermissions, userCan } from '../permissionUtils';
import * as Validators from '../../infrastructure/Validators';

export interface AdminCourtRolesProps extends FormContainerProps {
    courtRoles?: any[];
}

export interface AdminCourtRolesDisplayProps extends FormContainerProps {

}

class AdminCourtRolesDisplay extends React.PureComponent<AdminCourtRolesDisplayProps, any> {
    render() {
        const { data = [] } = this.props;
        return (
            <div />
        );
    }
}

export default class AdminCourtRoles extends FormContainerBase<AdminCourtRolesProps> {
    // NOTICE!
    // This key maps to the [appScope: FrontendScope] (in the token)
    // To set permissions for a new plugin, add a corresponding entry under System Settings > Components
    // with the name as defined as the plugin's name.
    name = 'ADMIN_COURT_ROLES';
    // END NOTICE
    reduxFormKey = 'assignments';
    formFieldNames = {
        courtRoles: 'assignments.courtRoles'
    };
    title: string = ' Court Roles';
    // pluginFiltersAreSet = false;
    showExpired = false;

    FormComponent = (props: FormContainerProps<AdminCourtRolesProps>) => {
        const { getPluginPermissions, setPluginFilters } = props;
        const { grantAll, permissions } = buildPluginPermissions(getPluginPermissions);

        // We can't use React hooks yet, and not sure if this project will ever be upgraded to 16.8
        // This is a quick n' dirty way to achieve the same thing
        let dataTableInstance: any;

        const { currentLocation, isLocationSet } = props;
        const loc = currentLocation;

        const onFilterLocation = (event: Event, newValue: any) => {
            if (setPluginFilters) {
                setPluginFilters({
                    courtRoles: {
                        locationId: newValue
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const onFilterCourtRole = (event: Event, newValue: any, previousValue: any, name: string) => {
            if (setPluginFilters) {
                setPluginFilters({
                    courtRoles: {
                        description: newValue
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const onFilterCourtRoleCode = (event: Event, newValue: any, previousValue: any, name: string) => {
            if (setPluginFilters) {
                setPluginFilters({
                    courtRoles: {
                        code: newValue
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const onFilterCourtRoleScope = (event: Event, newValue: any, previousValue: any, name: string) => {
            if (setPluginFilters) {
                setPluginFilters({
                    courtRoles: {
                        locationId: (parseInt(newValue, 10) !== 1) ? loc : null
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const onToggleExpiredClicked = () => {
            if (setPluginFilters) {
                this.showExpired = !this.showExpired;

                setPluginFilters({
                    courtRoles: {
                        isExpired: this.showExpired
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const onResetFilters = () => {
            if (setPluginFilters) {
                setPluginFilters({
                    courtRoles: {
                        locationId: undefined,
                        code: '',
                        description: ''
                    }
                }, setAdminCourtRolesPluginFilters);
            }
        };

        const courtRoleActions = [
            ({ fields, index, model }) => {
                return (model && !model.id || model && model.id === '')
                    ? (<RemoveRow fields={fields} index={index} model={model} showComponent={(grantAll || canManage || canDelete)} />)
                    : null;
            },
            ({ fields, index, model }) => {
                return (model && model.id && model.id !== '' && !model.isExpired)
                    ? (<ExpireRow fields={fields} index={index} model={model} showComponent={true} onClick={() => dataTableInstance.forceUpdate()} />)
                    : (model && model.isExpired)
                    ? (<UnexpireRow fields={fields} index={index} model={model} showComponent={true} onClick={() => dataTableInstance.forceUpdate()} />)
                    : null;
            },
            ({ fields, index, model }) => {
                return (model && model.id && model.id !== '')
                    ? (<DeleteRow fields={fields} index={index} model={model} showComponent={(grantAll || canManage || canDelete)} />)
                    : null;
            }
        ] as React.ReactType<ActionProps>[];

        return (
            <div>
            {/* Only use fixed if configured as a standalone page */}
            {/* <div className="fixed-filters-data-table"> */}
                <DataTable
                    ref={(dt) => dataTableInstance = dt}
                    fieldName={this.formFieldNames.courtRoles}
                    filterFieldName={(this.filterFieldNames) ? `${this.filterFieldNames.courtRoles}` : undefined}
                    title={''} // Leave this blank
                    buttonLabel={'Add Court Role'}
                    // TODO: Only display if the user has appropriate permissions
                    displayHeaderActions={true}
                    onResetClicked={onResetFilters}
                    onToggleExpiredClicked={onToggleExpiredClicked}
                    displayActionsColumn={true}
                    actionsColumn={DataTable.ActionsColumn({
                        actions: courtRoleActions
                    })}
                    columns={[
                        DataTable.SortOrderColumn('Sort Order', { fieldName: 'sortOrder', colStyle: { width: '100px' }, displayInfo: false, filterable: false }),
                        DataTable.TextFieldColumn('Type', { fieldName: 'description', displayInfo: false, filterable: true, filterColumn: onFilterCourtRole }),
                        DataTable.TextFieldColumn('Code', { fieldName: 'code', displayInfo: true, filterable: true, filterColumn: onFilterCourtRoleCode }),
                        DataTable.SelectorFieldColumn('Scope', { fieldName: 'isProvincialCode', selectorComponent: CodeScopeSelector, filterSelectorComponent: CodeScopeSelector, displayInfo: false, filterable: true, filterColumn: onFilterCourtRoleScope })
                    ]}
                    filterable={true}
                    showExpiredFilter={true}
                    expandable={false}
                    // expandedRows={[1, 2]}
                    groupBy={{
                        groupByKey: 'isProvincialCode',
                        valueMapLabels: {
                            0: {
                                label: 'Custom Roles',
                                style: {
                                    width: '3rem',
                                    backgroundColor: '#327AB7',
                                    color: 'white',
                                    border: '1px solid #327AB7'
                                }
                            },
                            1: {
                                label: 'Default Roles',
                                style: {
                                    width: '3rem',
                                    backgroundColor: '#999',
                                    color: 'white',
                                    border: '1px solid #999'
                                }
                            }
                        }
                    }}
                    // TODO: Only display if the user has appropriate permissions
                    shouldDisableRow={(model) => {
                        // TODO: Only disable if the user doesn't have permission to edit provincial codes
                        return false;
                        // return (!model) ? false : (model && model.id) ? model.isProvincialCode : false;
                    }}
                    shouldMarkRowAsDeleted={(model) => {
                        return model.isExpired;
                    }}
                    rowComponent={EmptyDetailRow}
                    modalComponent={EmptyDetailRow}
                />
            </div>
        );
    }

    DisplayComponent = (props: FormContainerProps<AdminCourtRolesDisplayProps>) => (
        <div>
            {/*<Alert>No roles exist</Alert>*/}
            <AdminCourtRolesDisplay {...props} />
        </div>
    )

    validate(values: AdminCourtRolesProps = {}): FormErrors | undefined {
        let errors: any = {};

        const formKeys = Object.keys(this.formFieldNames);

        if (formKeys) {
            formKeys.forEach((key) => {
                if (!values[key]) return;
                errors[key] = values[key].map((row: any) => (
                    {
                        description: Validators.validateWith(
                            Validators.required
                        )(row.description),
                        code: Validators.validateWith(
                            Validators.required
                        )(row.code)
                    }
                ));
            });
        }

        return (errors && Object.keys(errors).length > 0) ? errors : undefined;
    }

    fetchData(dispatch: Dispatch<{}>, filters: {} | undefined) {
        dispatch(getCourtRoles()); // This data needs to always be available for select lists
    }

    getData(state: RootState, filters: any | undefined) {
        // Get filter data
        const filterData = this.getFilterData(filters);

        // Get form data
        /* const courtRoles = (filters && filters.courtRoles !== undefined)
            ? findAllEffectiveCourtRoles(filters.courtRoles)(state) || []
            : getAllEffectiveCourtRoles(state) || []; */
        const courtRoles = (filters && filters.courtRoles !== undefined)
            ? findAllCourtRoles(filters.courtRoles)(state) || []
            : getAllEffectiveCourtRoles(state) || [];

        const courtRolesArray: any[] = courtRoles.map((role: any) => {
            return Object.assign({ isProvincialCode: (role.locationId === null) ? 1 : 0 }, role);
        });

        const currentLocation = getCurrentLocation(state);

        return {
            ...filterData,
            courtRoles: courtRolesArray,
            currentLocation
        };
    }

    getDataFromFormValues(formValues: {}, initialValues: {}): FormContainerProps {
        return super.getDataFromFormValues(formValues) || {
        };
    }

    mapDeletesFromFormValues(map: any) {
        const deletedCourtRoleIds: IdType[] = [];

        if (map.courtRoles) {
            const initialValues = map.courtRoles.initialValues;
            const existingIds = map.courtRoles.values.map((val: any) => val.id);

            const removeCourtRoleIds = initialValues
                .filter((val: any) => (existingIds.indexOf(val.id) === -1))
                .map((val: any) => val.id);

            deletedCourtRoleIds.push(...removeCourtRoleIds);
        }

        return {
            courtRoles: deletedCourtRoleIds
        };
    }

    mapExpiredFromFormValues(map: any, isExpired?: boolean) {
        isExpired = isExpired || false;
        const expiredCourtRoleIds: IdType[] = [];

        if (map.courtRoles) {
            const values = map.courtRoles.values;

            const courtRoleIds = values
                .filter((val: any) => val.isExpired === isExpired)
                .map((val: any) => val.id);

            expiredCourtRoleIds.push(...courtRoleIds);
        }

        return {
            courtRoles: expiredCourtRoleIds
        };
    }

    async onSubmit(formValues: any, initialValues: any, dispatch: Dispatch<any>) {
        const data: any = this.getDataFromFormValues(formValues, initialValues);
        const dataToExpire: any = this.getDataToExpireFromFormValues(formValues, initialValues, true) || {};
        const dataToUnexpire: any = this.getDataToExpireFromFormValues(formValues, initialValues, false) || {};
        const dataToDelete: any = this.getDataToDeleteFromFormValues(formValues, initialValues) || {};

        // Grab the currentLocation off of the formValues.assignments object
        const { currentLocation } = formValues.assignments;

        // Delete records before saving new ones!
        const deletedCourtRoles: IdType[] = dataToDelete.courtRoles as IdType[];

        // Expire records before saving new ones!
        const expiredCourtRoles: IdType[] = dataToExpire.courtRoles as IdType[];
        const unexpiredCourtRoles: IdType[] = dataToUnexpire.courtRoles as IdType[];

        let courtRoles: Partial<CourtRoleCode>[];
        courtRoles = data.courtRoles.map((c: Partial<CourtRoleCode>) => ({
            ...c,
            createdBy: 'DEV - FRONTEND',
            updatedBy: 'DEV - FRONTEND',
            createdDtm: new Date().toISOString(),
            updatedDtm: new Date().toISOString()
        }));

        if (!(currentLocation === 'ALL_LOCATIONS' || currentLocation === '')) {
            courtRoles = courtRoles.map((c: Partial<CourtRoleCode>) => {
                const isNewRow = !c.id;
                if (isNewRow) {
                    const locationId = (c.isProvincialCode !== '1') ? currentLocation : null;
                    return { ...c, locationId: locationId };
                } else {
                    return { ...c };
                }
            });
        }

        if (deletedCourtRoles.length > 0) {
            await dispatch(deleteCourtRoles(deletedCourtRoles));
        }

        if (expiredCourtRoles.length > 0) {
            await dispatch(expireCourtRoles(expiredCourtRoles));
        }

        if (unexpiredCourtRoles.length > 0) {
            await dispatch(unexpireCourtRoles(unexpiredCourtRoles));
        }

        if (courtRoles.length > 0) {
            await dispatch(createOrUpdateCourtRoles(courtRoles));
        }
    }
}
