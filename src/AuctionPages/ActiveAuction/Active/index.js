import React, {Fragment} from 'react';

import {currentHeight, getActiveAuctions,} from '../../../auction/explorer';
import {isWalletSaved, showMsg,} from '../../../auction/helpers';
import {css} from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import SyncLoader from 'react-spinners/SyncLoader';
import {
    Button,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import {getAssets} from '../../../auction/nodeWallet';
import number from 'd3-scale/src/number';
import ActiveBox from "./activeBox";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastUpdated: 0,
            tokenId: '',
            modal: false,
            modalLoading: true,
            assets: {},
            loading: true,
            auctions: [],
            tooltip: false,
            currentHeight: 0,
            myBids: false,
        };
        this.refreshInfo = this.refreshInfo.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.canStartAuction = this.canStartAuction.bind(this);
        this.updateAssets = this.updateAssets.bind(this);
        this.closeMyBids = this.closeMyBids.bind(this);
    }

    componentDidMount() {
        console.log(this.state);
        currentHeight().then((res) => {
            this.setState({ height: res });
        });
        this.refreshInfo(true);
        this.refreshTimer = setInterval(this.refreshInfo, 5000);
    }

    componentWillUnmount() {
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
    }

    closeMyBids() {
        this.setState(this.setState({myBids: false}))
    }

    openAuction() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new auction, you have to configure the wallet first.',
                true
            );
        } else {
            this.toggleModal();
        }
    }

    canStartAuction() {
        return (
            this.state.tokenId !== undefined &&
            this.state.tokenId.length > 0 &&
            this.state.initialBid > 0 &&
            this.state.auctionDuration > 0 &&
            this.state.auctionStep >= 0 &&
            this.state.tokenQuantity > 0
        );
    }

    updateAssets() {
        this.setState({ modalLoading: true });
        return getAssets()
            .then((res) => {
                this.setState({ assets: res.assets });
                this.setState({ ergBalance: res.balance });
            })
            .finally(() => {
                this.setState({ modalLoading: false });
            });
    }

    toggleModal() {
        this.setState({
            modal: !this.state.modal,
        });
        if (this.state.modal) {
            this.setState({ modalLoading: false, assets: {} });
        } else {
            this.updateAssets().then(() => {
                let assets = this.state.assets;
                if (Object.keys(assets).length === 0)
                    showMsg('Your wallet contains no tokens to auction!', true);
                else
                    this.setState({
                        tokenId: Object.keys(assets)[0],
                        tokenQuantity: Object.values(assets)[0],
                    });
            }).catch(() => {
                showMsg(
                    'Error getting assets from wallet. Check your wallet accessibility.',
                    true
                );
            });
        }
    }

    refreshInfo(force = false) {
        if (!force) {
            this.setState({ lastUpdated: this.state.lastUpdated + 5 });
            if (this.state.lastUpdated < 40) return;
        }
        this.setState({ lastUpdated: 0 });
        currentHeight().then((height) =>
            this.setState({ currentHeight: height })
        );
        getActiveAuctions()
            .then((boxes) => {
                boxes.forEach((box) => {
                    box.description =
                        'This is a NFT containing word ergo in base16 - also is the first token auctioned on top of Ergo';
                    box.remBlock = 233;
                    box.doneBlock = 50;
                    box.finalBlock = 32000;
                    box.increase = 57;
                    box.minStep = 1000000000;
                    box.seller =
                        '9gAKeRu1W4Dh6adWXnnYmfqjCTnxnSMtym2LPPMPErCkusCd6F3';
                    box.bidder =
                        '9hyV1owHpWKuWUnd3cTbTTptCzRfWQFhA9Bs8dSKNcNWicmc6gz';
                    box.loader = false;
                });
                this.setState({ auctions: boxes, loading: false, tooltip: true });
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    toggle() {
        this.setState({
            tooltip: !this.state.tooltip,
        });
    }

    render() {
        const listItems = this.state.auctions.map((box) => {
            return (<ActiveBox box={box}/>);
        });
        return (
            <Fragment>
                <Modal
                    size="lg"
                    isOpen={this.state.modal}
                    toggle={this.toggleModal}
                    className={this.props.className}
                >
                    <ModalHeader toggle={this.toggleModal}>
                        <span className="fsize-1 text-muted">New Auction</span>
                    </ModalHeader>
                    <ModalBody>
                        <Container>
                            <Row>
                                <SyncLoader
                                    css={override}
                                    size={8}
                                    color={'#0b473e'}
                                    loading={this.state.modalLoading}
                                />
                            </Row>

                            <Form>
                                <FormGroup>
                                    <Label for="tokenId">Token</Label>
                                    <Input
                                        value={this.state.tokenId}
                                        onChange={(event) => {
                                            this.setState({
                                                tokenId: event.target.value,
                                                tokenQuantity: this.state
                                                    .assets[event.target.value],
                                            });
                                        }}
                                        type="select"
                                        id="tokenId"
                                        invalid={this.state.tokenId === ''}
                                    >
                                        {Object.keys(this.state.assets).map(
                                            (id) => {
                                                return <option>{id}</option>;
                                            }
                                        )}
                                    </Input>
                                    <FormFeedback invalid>
                                        No token to select from.
                                    </FormFeedback>
                                    <FormText>
                                        These tokens are loaded from your wallet.
                                    </FormText>
                                </FormGroup>
                                <div className="divider" />
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="tokenQuantity">
                                                Token Quantity
                                            </Label>
                                            <Input
                                                min={1}
                                                type="number"
                                                step="1"
                                                value={this.state.tokenQuantity}
                                                onChange={(event) => {
                                                    let cur =
                                                        event.target.value;
                                                    this.setState({
                                                        tokenQuantity: parseInt(
                                                            cur
                                                        ),
                                                    });
                                                }}
                                                id="tokenQuantity"
                                                invalid={
                                                    this.state.assets[
                                                        this.state.tokenId
                                                    ] < this.state.tokenQuantity
                                                }
                                            />
                                            <FormFeedback invalid>
                                                More than balance, selected
                                                token's balance is{' '}
                                                {
                                                    this.state.assets[
                                                        this.state.tokenId
                                                    ]
                                                }
                                            </FormFeedback>
                                            <FormText>
                                                Specify token quantity to be
                                                auctioned.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="bid">Initial Bid</Label>
                                            <InputGroup>
                                                <Input
                                                    min={0.1}
                                                    type="number"
                                                    value={
                                                        this.state.initialBid
                                                    }
                                                    onChange={(event) => {
                                                        let val = number(
                                                            event.target.value
                                                        );
                                                        if (
                                                            !isNaN(val) &&
                                                            val < 0
                                                        ) {
                                                            this.setState({
                                                                initialBid: 0.1,
                                                            });
                                                        } else {
                                                            this.setState({
                                                                initialBid:
                                                                    event.target
                                                                        .value,
                                                            });
                                                        }
                                                    }}
                                                    id="bid"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>
                                                        ERG
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                Specify initial bid of the
                                                auction.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="divider" />
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="auctionStep">
                                                Minimum Step
                                            </Label>
                                            <InputGroup>
                                                <Input
                                                    type="number"
                                                    value={
                                                        this.state.auctionStep
                                                    }
                                                    onChange={(event) =>
                                                        this.setState({
                                                            auctionStep:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    id="auctionStep"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>
                                                        ERG
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                The bidder must increase the bid
                                                by at least this value.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="duration">
                                                Auction Duration
                                            </Label>
                                            <InputGroup>
                                                <Input
                                                    type="number"
                                                    value={
                                                        this.state
                                                            .auctionDuration
                                                    }
                                                    onChange={(event) =>
                                                        this.setState({
                                                            auctionDuration:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    id="duration"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>
                                                        Blocks
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                Auction will last for this
                                                number of blocks. For example
                                                set to 720 for your auction to
                                                last ~1 day.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="divider" />
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <Input
                                        invalid={
                                            this.state.description !==
                                                undefined &&
                                            this.state.description.length > 150
                                        }
                                        value={this.state.description}
                                        onChange={(event) =>
                                            this.setState({
                                                description: event.target.value,
                                            })
                                        }
                                        type="textarea"
                                        name="text"
                                        id="description"
                                    />
                                    <FormFeedback invalid>
                                        At most 150 characters!
                                    </FormFeedback>
                                    <FormText>
                                        You can explain about the token you are
                                        auctioning here.
                                    </FormText>
                                </FormGroup>
                            </Form>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.toggleModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.canStartAuction()}
                            // onClick={() =>
                            //
                            // }
                        >
                            Create Auction
                        </Button>
                    </ModalFooter>
                </Modal>

                <div className="app-page-title">
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                <i className="pe-7s-volume2 icon-gradient bg-night-fade" />
                            </div>
                            <div>
                                Active Actions
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    Here you can see current active auctions.
                                    Last updated {this.state.lastUpdated}{' '}
                                    seconds ago.
                                </div>
                            </div>
                        </div>
                        <div className="page-title-actions">
                            <TitleComponent2 />
                        </div>
                        <Button
                            onClick={this.openAuction}
                            outline
                            className="btn-outline-lin m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-plus-circle"> </i>
                            <span>New Auction</span>
                        </Button>
                    </div>
                </div>
                {!this.state.loading && this.state.auctions.length === 0 && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        No Active Auctions
                    </strong>
                )}
                {this.state.loading ? (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <PropagateLoader
                            css={override}
                            size={20}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />
                    </div>
                ) : (
                    <Row>{listItems}</Row>
                )}
            </Fragment>
        );
    }
}