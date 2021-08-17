import React from 'react';
import {
    Button,
    CardFooter,
    Col,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Progress,
    UncontrolledButtonDropdown,
} from 'reactstrap';
import {
    friendlyAddress,
    friendlyName,
    friendlyToken,
    getAddrUrl,
    getTxUrl,
    getWalletAddress,
    isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import { ResponsiveContainer } from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faEllipsisV, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { css } from '@emotion/core';
import {
    auctionWithExtensionTree,
    getSpendingTx,
} from '../../../auction/explorer';
import PlaceBidModal from './placeBid';
import MyBidsModal from './myBids';
import BidHistory from './bidHistory';
import { Row } from 'react-bootstrap';
import ArtworkDetails from '../../artworkDetails';
import {Link} from "react-router-dom";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ActivePicture extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bidModal: false,
            myBidsModal: false,
            detailsModal: false,
        };
        this.openBid = this.openBid.bind(this);
        this.openMyBids = this.openMyBids.bind(this);
        this.openDetails = this.openDetails.bind(this);
    }

    openDetails() {
        this.setState({ detailsModal: !this.state.detailsModal });
    }

    getTime(blockRem) {
        let time = blockRem * 2
        if (time <= 60) return [time, 'Minutes']
        time = (time / 60).toFixed(0)
        if (time <= 24) return [time, 'Hours']
        time = (time / 24).toFixed(0)
        return [time, 'Days']
    }

    openBid() {
        if (this.state.bidModal) {
            this.setState({ bidModal: !this.state.bidModal });
            return;
        }
        if (!isWalletSaved()) {
            showMsg(
                'In order to place bids, you have to configure the wallet first.',
                true
            );
        } else if (this.props.box.remBlock <= 0) {
            showMsg(
                'This auction is finished! It is pending for withdrawal.',
                true
            );
        } else {
            this.setState({ bidModal: !this.state.bidModal });
        }
    }

    openMyBids() {
        this.setState({ myBidsModal: !this.state.myBidsModal });
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    render() {
        let box = this.props.box;
        let time = this.getTime(box.remBlock)
        return (
            <Col key={box.id} sm="12" md="6" lg="4" xl="3">
                <PlaceBidModal
                    isOpen={this.state.bidModal}
                    box={this.props.box}
                    close={this.openBid}
                    assemblerModal={this.props.assemblerModal}
                />
                <MyBidsModal
                    isOpen={this.state.myBidsModal}
                    box={this.props.box}
                    close={this.openMyBids}
                    highText="current active bid"
                />
                <BidHistory
                    close={this.openDetails}
                    box={this.props.box}
                    isOpen={this.state.detailsModal}
                />
                <div className="card mb-3 bg-white widget-chart">
                    
                    <b class="fsize-1 text-truncate" style={{marginTop: 8}}>{this.props.box.tokenName}</b>

                    <div className="widget-chart-actions">
                        <UncontrolledButtonDropdown direction="left">
                            <DropdownToggle color="link">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-md-left">
                                <Nav vertical>
                                    <NavItem className="nav-item-header">
                                        General
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            href={
                                                '#/auction/specific/' +
                                                this.props.box.id
                                            }
                                        >
                                            Link to Auction
                                        </NavLink>
                                        <NavLink
                                            onClick={() => this.openMyBids()}
                                        >
                                            My Bids
                                        </NavLink>
                                        <NavLink
                                            onClick={() =>
                                                this.setState({
                                                    detailsModal: true,
                                                })
                                            }
                                        >
                                            Details
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>

                    <div className="widget-chart-content">
                        <ResponsiveContainer height={10}>
                            <SyncLoader
                                css={override}
                                size={8}
                                color={'#0086d3'}
                                loading={this.props.box.loader}
                            />
                        </ResponsiveContainer>

                        <div style={{ cursor: 'pointer' }} className="imgDiv">
                            <ArtworkDetails
                                isOpen={this.state.artDetail}
                                close={() =>
                                    this.setState({
                                        artDetail: !this.state.artDetail,
                                    })
                                }
                                tokenId={this.props.box.assets[0].tokenId}
                                tokenName={this.props.box.tokenName}
                                tokenDescription={
                                    this.props.box.tokenDescription
                                }
                                artHash={this.props.box.artHash}
                                artworkUrl={this.props.box.artworkUrl}
                            />
                            <img
                                onClick={() =>
                                    this.setState({ artDetail: true })
                                }
                                className="auctionImg"
                                src={
                                    this.props.box.artworkUrl
                                        ? this.props.box.artworkUrl
                                        : 'http://revisionmanufacture.com/assets/uploads/no-image.png'
                                }
                            />
                        </div>
                        <ReactTooltip effect="solid" place="bottom" />

                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // height: '70px',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                    fontSize: '12px',
                                }}
                            >
                                <p className="text-primary mr-2 ml-2">
                                    <div className="text-truncate">{this.props.box.description}</div>
                                    <Link
                                        to={'/auction/active?type=picture&artist=' + this.props.box.artist}
                                    >
                                        <b
                                        >
                                            {' '}- By {friendlyAddress(this.props.box.artist, 4)}
                                        </b></Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='mb-2'>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: '13px'
                            }}
                            className="widget-subheading m-1"
                        >
                            <span data-tip={this.props.box.seller}>
                                Seller{' '}
                                {friendlyAddress(this.props.box.seller, 9)}
                            </span>
                            <i
                                onClick={() =>
                                    this.showAddress(this.props.box.seller)
                                }
                                data-tip="see seller's address"
                                style={{
                                    fontSize: '1rem',
                                    marginLeft: '5px',
                                }}
                                className="pe-7s-help1 icon-gradient bg-night-sky"
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: '13px'
                            }}
                            className="widget-subheading m-1"
                        >
                            <span data-tip={this.props.box.bidder}>
                                Bidder{' '}
                                {friendlyAddress(this.props.box.bidder, 9)}
                            </span>
                            <i
                                onClick={() =>
                                    this.showAddress(this.props.box.bidder)
                                }
                                data-tip="see current bidder's address"
                                style={{
                                    fontSize: '1rem',
                                    marginLeft: '5px',
                                }}
                                className="pe-7s-help1 icon-gradient bg-night-sky"
                            />
                        </div>
                    </div>
                    <CardFooter>
                        <Col md={6} className="widget-description">
                            <Row>
                                <span>
                                    <b className="fsize-1">
                                        {(this.props.box.value / 1e9).toFixed(
                                            2
                                        )}{' '}
                                        ERG
                                    </b>{' '}
                                    <text
                                        style={{ fontSize: '10px' }}
                                        className="text-success pl-1 pr-1"
                                    >
                                        {this.props.box.increase}%
                                        <FontAwesomeIcon icon={faAngleUp} />
                                    </text>
                                </span>
                            </Row>
                        </Col>

                        <Col md={6} className="justify-content-end ml-3">
                            <div className="widget-content">
                                <div className="widget-content-outer">
                                    <div className="widget-content-wrapper">
                                        <div className="widget-content-left mr-3">
                                            <div className="widget-numbers fsize-1 text-muted">
                                                ~{time[0]}
                                            </div>
                                        </div>
                                        <div className="widget-content-right">
                                            <div
                                                data-tip={
                                                    this.props.box.ergoTree ===
                                                    auctionWithExtensionTree
                                                        ? 'Auto Extend Enabled'
                                                        : ''
                                                }
                                                className="text-muted opacity-6"
                                            >
                                                {time[1]}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="widget-progress-wrapper">
                                        <Progress
                                            className="progress-bar-xs progress-bar-animated-alt"
                                            value={this.props.box.doneBlock}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>


                    </CardFooter>

                    <button type="button" class="btn btn-outline-primary btn-lg" style={{fontSize: 14}} 
                    onClick={(e) => {
                        e.preventDefault();
                        this.openBid();
                    }}>
                        <text>
                            Place Bid
                        </text>{' '}
                        <text>
                            for{' '}
                            <b>
                                {(this.props.box.value +
                                    this.props.box.minStep) /
                                    1e9}{' '}
                                ERG
                            </b>
                        </text>
                    </button>

                </div>
            </Col>
        );
    }
}
