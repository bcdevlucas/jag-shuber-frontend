import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { RootState } from '../../store';
import {
    deputyViewVisibleWeek,
    isShowWorkSections
} from '../../modules/schedule/selectors';
import {
    updateDeputyViewWeekStart,
    updateShowWorkSections
} from '../../modules/schedule/actions';
import { TimeType } from '../../api';
import CalendarButton from '../../components/CalendarButton/CalendarButton';
import {
    Button,
    Glyphicon
} from 'react-bootstrap';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import './ScheduleDeputyViewControl.css';

interface ScheduleDeputyViewControlsProps {
}

interface ScheduleDeputyViewControlsDispatchProps {
    updateVisibleWeek: (weekStart: any) => void;
    updateShowWorkSections: (show: boolean) => void;
}

interface ScheduleDeputyViewControlsStateProps {
    weekStart?: TimeType;
    includeWorkSection?: boolean;
}

class ScheduleDeputyViewControls extends React.Component<ScheduleDeputyViewControlsProps
    & ScheduleDeputyViewControlsDispatchProps
    & ScheduleDeputyViewControlsStateProps> {

    render() {
        const {
            updateVisibleWeek,
            weekStart = moment().startOf('week').toISOString(),
            includeWorkSection = true,
            // tslint:disable-next-line:no-shadowed-variable
            updateShowWorkSections
        } = this.props;
        return (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'row-reverse',
                    marginRight: '10%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <span title="Display Work Section">
                    <Toggle
                        style={{marginRight: 5}}
                        defaultChecked={includeWorkSection}
                        onChange={() => updateShowWorkSections(!includeWorkSection)}
                        icons={{
                            checked: <span style={{ color: 'white'}}>WS</span>,
                            unchecked: <span style={{ color: 'white'}}>WS</span>,
                        }}

                    />
                    </span>
                    {/* <span style={{ color: 'white', marginTop: 2, marginLeft: 3 }}>Work Sections</span> */}
                    <Button
                        bsStyle="link"
                        bsSize="large"
                        style={{ color: 'white' }}
                        onClick={() => window.print()}
                    >
                        <Glyphicon glyph="print" />
                    </Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: 5}}>
                    <Button
                        onClick={() => updateVisibleWeek(
                            moment(weekStart).subtract('week', 1)
                        )}
                        bsStyle="link"
                        bsSize="large"
                        style={{ color: 'white' }}
                    >
                        <Glyphicon glyph="chevron-left" />
                    </Button>
                    <CalendarButton
                        onChange={(selectedDate) => updateVisibleWeek(
                            moment(selectedDate).startOf('week')
                        )}
                        defaultValue={moment(weekStart)}
                        todayOnClick={() => updateVisibleWeek(
                            moment().startOf('week')
                        )}
                    />
                    <Button
                        onClick={() => updateVisibleWeek(
                            moment(weekStart).add('week', 1)
                        )}
                        bsStyle="link"
                        bsSize="large"
                        style={{ color: 'white' }}
                    >
                        <Glyphicon glyph="chevron-right" />
                    </Button>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => {
    return {
        weekStart: deputyViewVisibleWeek(state),
        includeWorkSection: isShowWorkSections(state)
    };
};

const mapDispatchToProps = {
    updateVisibleWeek: updateDeputyViewWeekStart,
    updateShowWorkSections: updateShowWorkSections
};

// tslint:disable-next-line:max-line-length
export default connect<ScheduleDeputyViewControlsStateProps, ScheduleDeputyViewControlsDispatchProps, ScheduleDeputyViewControlsProps>(
    mapStateToProps, mapDispatchToProps)(ScheduleDeputyViewControls);