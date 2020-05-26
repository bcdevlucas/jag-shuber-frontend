import * as React from 'react';
import { IdType } from '../../api';
import { RootState } from '../../store';
import { Dispatch } from 'redux';
import { FormErrors } from 'redux-form';
import { deletedDiff, detailedDiff } from 'deep-object-diff';

// There's no export for this...
const preserveArray = require('deep-object-diff/dist/preseveArray');

export interface FormContainerProps<T = any> {
    // TODO: We aren't really using objectId anymore, we should remove it...
    //  It's a remnant from converting the SheriffProfilePlugin to the current
    //  forms implementation...
    objectId?: IdType;
    data?: T;
    pluginAuth?: any;
    pluginPermissions?: any;
    getPluginPermissions?: Function;
    pluginFilters?: any;
    setPluginFilters?: Function;
    // TODO: It would be nice if we could somehow pass in showSheriffProfileModal some other way that was more declarative, and from the plugin...
    //  This is easy and works for now though.
    showSheriffProfileModal?: (sheriffId: IdType, isEditing: boolean, sectionName?: string) => {};
    // TODO: Is there a LocationProps that exists? We are / will be using this in more than one place
    // TODO: Not my fav having location coupled here, but it gets the job done
    currentLocation?: string;
    isLocationSet?: boolean;
    displayFilters?: boolean;
}

type AuthPermissions = string[];
type PluginPermissions = { [key: string]: string[] };

export interface FormContainer<T = any> {
    /**
     * A unique plugin name, no spaces please eg. /[A-Za-z0-9_-]+/
     * @type {string}
     * @memberof Form
     */
    name: string;
    /**
     * The form key, used by redux-form, to bind the form instance to redux data slices
     * @type {string}
     * @memberof Form
     */
    reduxFormKey: string;
    useAuth?: boolean;
    pluginPermissions: any; // TODO: We can type this better
    renderDisplay(props: FormContainerProps<T>): React.ReactNode;
    renderFormFields(props: FormContainerProps<T>): React.ReactNode;
    hasErrors(errors: any): boolean;
    // onSubmit(objectId: IdType | undefined, formValues: any, dispatch: Dispatch<any>): Promise<any | void>;
    onSubmit(formValues: any, initialValues: any, dispatch: Dispatch<any>): Promise<any | void>;
    fetchData(dispatch: Dispatch<any>, filters: {} | undefined): void;
    getData(state: RootState, filters?: {} | undefined): T | undefined;
    validate(values: T): FormErrors<T> | undefined;
}

export interface FormValues {
    added: any[];
    updated: any[];
    expired: any[];
    expiredIds: IdType[];
    unexpired: any[];
    unexpiredIds: IdType[];
    deleted: any[];
    deletedIds: IdType[];
}

export type FormValuesDiff = { [key: string]: FormValues };

export abstract class FormContainerBase<T = any> implements FormContainer<T> {
    /**
     * A unique plugin name, no spaces please eg. /[A-Za-z0-9_-]+/
     * @type {string}
     * @memberof Form
     */
    abstract name: string;
    /**
     * The form key, used by redux-form, to bind the form instance to redux data slices
     * @type {string}
     * @memberof Form
     */
    abstract reduxFormKey: string;

    abstract get title(): string;

    public useAuth?: boolean;

    protected _pluginPermissions?: string[];

    public get pluginPermissions(): string[] | undefined {
        return this._pluginPermissions;
    }

    public set pluginPermissions(config: string[] | undefined) {
        this._pluginPermissions = config;
    }

    protected _pluginAuth?: AuthPermissions;

    public get pluginAuth(): AuthPermissions | undefined {
        return this._pluginAuth;
    }

    public set pluginAuth(config: AuthPermissions | undefined) {
        this._pluginAuth = config;
    }

    protected _dispatch?: Dispatch<any>;

    public get dispatch(): Dispatch<any> | undefined {
        return this._dispatch;
    }

    public set dispatch(dispatch: Dispatch<any> | undefined) {
        this._dispatch = dispatch;
    }

    /**
     * The formFieldNames are used to enhance to experience
     * when submitting / saving the profile.  These fields
     * should be the names of fields used by this plugin
     * to allow automatic determination of errors that
     * exist within specific plugins (i.e. to highlight tabs
     * with errors etc.)
     *
     * @abstract
     * @type {{ [key: string]: string }}
     * @memberof FormContainerBase
     */
    abstract formFieldNames: { [key: string]: string };

    // TODO: Might need to remove this, this isn't in the right place?
    protected get filterFieldNames() {
        const fieldNames = {};

        Object.keys(this.formFieldNames)
            .map(key => fieldNames[key] = `${this.formFieldNames[key]}_filters`);

        return fieldNames as { [key: string]: string };
    }

    DisplayComponent?: React.ReactType<FormContainerProps<T>>;
    FormComponent?: React.ReactType<FormContainerProps<T>>;
    DetailComponent: React.SFC<any>;

    protected getPluginPermissions(): string[] {
        return this.pluginPermissions || [];
    }

    protected mapDeletesFromFormValues(map: {}) {
        return {};
    }

    protected mapExpiredFromFormValues(map: {}, isExpired?: boolean) {
        return {};
    }

    protected getFilterData(filters: any) {
        return Object.keys(this.filterFieldNames)
            .reduce((data: any, filterKey: string, idx: number) => {
                const dataKey = this.filterFieldNames[filterKey]
                    .split(`${this.reduxFormKey}.`).pop() as string;

                if (filters[filterKey]) data[dataKey] = filters[filterKey];

                return data;
            }, {});
    }

    /* protected getDataFromFormValues(formValues: any, initialValues?: any) {
        if (!initialValues) return formValues[this.reduxFormKey];

        const initial = initialValues[this.reduxFormKey];
        const values = formValues[this.reduxFormKey];

        const data: any = {};

        const formKeys = Object.keys(this.formFieldNames);
        // detailedDiff will return a diff object with added, deleted, and updated keys
        // https://www.npmjs.com/package/deep-object-diff
        const diffKeys = ['added', 'updated'];
        formKeys.forEach(key => {
            let isDirty = false;
            const diff = detailedDiff(initial[key], values[key]);
            diffKeys.forEach(diffKey => {
                if (Object.keys(diff[diffKey]).length > 0) isDirty = true;
            });

            if (isDirty) data[key] = values[key];
        });

        return data;
    } */

    /**
     * @param values
     * @param normalizeFn A function to flatten the values
     */
    protected getAddedFormValues(values: any, normalizeFn?: (values: any) => any[]) {
        values = normalizeFn ? normalizeFn(values) : values;
        return values
            .filter((value: any) => !value.id);
    }

    protected getUpdatedFormValues(
        initialFormValues: any,
        updatedFormValues: any,
        normalizeFn?: (values: any) => any[]
    ) {
        initialFormValues = normalizeFn ? normalizeFn(initialFormValues) : initialFormValues;
        updatedFormValues = normalizeFn ? normalizeFn(updatedFormValues) : updatedFormValues;

        const initialFormValueIds = initialFormValues
            .filter((value: any) => !!value)
            .map((value: any) => value.id);

        return updatedFormValues
            .filter((value: any) => !!value.id)
            .filter((value: any) => initialFormValueIds.includes(value.id))
            .filter((value: any) => initialFormValues
                .find((initValue: any) =>
                    (value.id === initValue.id) &&
                    (JSON.stringify(value) !== JSON.stringify(initValue))
                )
            )
            .filter((value: any) => value && !value.isExpired);
    }

    protected getExpiredFormValues(
        initialFormValues: any,
        updatedFormValues: any,
        normalizeFn?: (values: any) => any[]
    ) {
        initialFormValues = normalizeFn ? normalizeFn(initialFormValues) : initialFormValues;
        updatedFormValues = normalizeFn ? normalizeFn(updatedFormValues) : updatedFormValues;

        const initialFormValueIds = initialFormValues
            .filter((value: any) => !!value)
            .map((value: any) => value.id);

        return updatedFormValues
            .filter((value: any) => !!value.id)
            .filter((value: any) => initialFormValueIds.includes(value.id))
            .filter((value: any) => value && value.isExpired && initialFormValues
                .find((initValue: any) => value.id === initValue.id && !initValue.isExpired));
    }

    protected getUnexpiredFormValues(
        initialFormValues: any,
        updatedFormValues: any,
        normalizeFn?: (values: any) => any[]
    ) {
        initialFormValues = normalizeFn ? normalizeFn(initialFormValues) : initialFormValues;
        updatedFormValues = normalizeFn ? normalizeFn(updatedFormValues) : updatedFormValues;

        const initialFormValueIds = initialFormValues
            .filter((value: any) => !!value)
            .map((value: any) => value.id);

        return updatedFormValues
            .filter((value: any) => !!value.id)
            .filter((value: any) => initialFormValueIds.includes(value.id))
            .filter((value: any) => value && !value.isExpired && initialFormValues
                .find((initValue: any) => value.id === initValue.id && initValue.isExpired));
    }

    protected getDeletedFormValues(
        initialFormValues: any,
        updatedFormValues: any,
        normalizeFn?: (values: any) => any[]
    ) {
        initialFormValues = normalizeFn ? normalizeFn(initialFormValues) : initialFormValues;
        updatedFormValues = normalizeFn ? normalizeFn(updatedFormValues) : updatedFormValues;

        const updatedFormValueIds = updatedFormValues
            .filter((value: any) => !!value)
            .map((value: any) => value.id);

        return initialFormValues
            .filter((value: any) => !updatedFormValueIds.includes(value.id));
    }

    protected getIdsFromFormValues(formValues: any) {
        return formValues.map((value: any) => value.id);
    }

    protected processGroupedFormValues(
        initialFormValues: any,
        updatedFormValues?: any,
        callback?: any
    ) {
        const initialValues = Object.keys(initialFormValues)
            .reduce((acc: any, cur: any) => {
                return acc.concat(initialFormValues[cur]);
            }, []);

        const updatedValues = Object.keys(updatedFormValues)
            .reduce((acc: any, cur: any) => {
                return acc.concat(updatedFormValues[cur]);
            }, []);

        return callback(initialValues, updatedValues);
    }

    protected getDataFromFormValues(
        formValues: any,
        initialValues?: any,
        formKey?: string
    ): FormValuesDiff | FormValues {
        if (!initialValues) return formValues[this.reduxFormKey];

        const initial = initialValues[this.reduxFormKey];
        const values = formValues[this.reduxFormKey];

        let map: any = {};

        const formKeys = Object.keys(this.formFieldNames);
        formKeys.forEach(key => {
            const addedFormValues = this.getAddedFormValues(values[key]);
            const updatedFormValues = this.getUpdatedFormValues(initial[key], values[key]);
            const expiredFormValues = this.getExpiredFormValues(initial[key], values[key]);
            const unexpiredFormValues = this.getUnexpiredFormValues(initial[key], values[key]);
            const deletedFormValues = this.getDeletedFormValues(initial[key], values[key]);

            const expiredFormValueIds = this.getIdsFromFormValues(expiredFormValues);
            const unexpiredFormValueIds = this.getIdsFromFormValues(unexpiredFormValues);
            const deletedFormValueIds = this.getIdsFromFormValues(deletedFormValues);

            const diff = {
                added: addedFormValues,
                updated: updatedFormValues,
                expired: expiredFormValues,
                expiredIds: expiredFormValueIds,
                unexpired: unexpiredFormValues,
                unexpiredIds: unexpiredFormValueIds,
                deleted: deletedFormValues,
                deletedIds: deletedFormValueIds
            };

            if (formKey && formKey === key) {
                map[key] = diff;
            } else if (!formKey) {
                map[key] = diff;
            }
        });

        return formKey ? map[formKey] as FormValues : map as FormValuesDiff;
    }

    // TODO: At some point, we should consolidate common functions between FormContainer and SheriffProfilePlugin
    containsPropertyPath(errors: Object = {}, propertyPath: string = '') {
        const propertyNames = propertyPath.split('.');
        let propertyError = errors;
        if (propertyNames.length === 0) {
            return false;
        }
        // Assume there is an error until proven innocent
        let containsPath = true;
        for (let i = 0; i < propertyNames.length; i++) {
            const propertyName = propertyNames[i];
            if (!propertyError.hasOwnProperty(propertyName)) {
                containsPath = false;
                break;
            }

            propertyError = propertyError[propertyName];
        }

        // If we're dealing with a plugin that has nested redux forms,
        // we need to make an extra check to handle FormArrays
        if (containsPath && Array.isArray(propertyError)) {
            // Filter out any undefined values they are just in the error array to maintain the row index
            containsPath = propertyError.filter(error => error).length > 0;
        }

        // We've traversed the whole property string finding each piece, there is an error
        return containsPath;
    }

    renderDisplay(props: FormContainerProps<T>): React.ReactNode {
        const { DisplayComponent } = this;
        return (
            DisplayComponent
                ? <DisplayComponent key={this.name} {...props} />
                : (
                    <div>
                        FormContainer: DisplayComponent not set
                    </div>
                )
        );
    }

    renderFormFields(props: FormContainerProps<T>): React.ReactNode {
        const { FormComponent } = this;
        const getPluginPermissions = this.getPluginPermissions.bind(this);
        return (
            FormComponent && <FormComponent key={this.name} {...props} getPluginPermissions={getPluginPermissions} />
        );
    }

    renderDetail(): React.SFC {
        const { DetailComponent } = this;
        const getPluginPermissions = this.getPluginPermissions.bind(this);
        return (detailProps: any) => (<DetailComponent {...detailProps}  getPluginPermissions={getPluginPermissions} />);
    }

    async onSubmit(formValues: any, initialValues: any, dispatch: Dispatch<any>): Promise<any | void> {
        // does nothing
    }

    hasErrors(errors: any) {
        // Traverse first nodes of error object checking for errors on each
        return Object.keys(errors).some(eKey => (
            Object.keys(this.formFieldNames).some(key => (
                this.containsPropertyPath(errors[eKey], this.formFieldNames[key])
            ))
        ));
    }

    fetchData(dispatch: Dispatch<any>, filters: {} | undefined) {
        // does nothing
    }

    getData(state: RootState, filters?: {} | undefined): T | undefined {
        // Does nothing
        return undefined;
    }

    validate(values: T): FormErrors<T> | undefined {
        return undefined;
    }
}

export abstract class FormContainerSectionPlugin<T = any> extends FormContainerBase<T> {
    abstract get title(): string;
}
