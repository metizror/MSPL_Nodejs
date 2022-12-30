ALTER TABLE `supplier_branch` ADD `is_superadmin` INT(11) NOT NULL DEFAULT '0' AFTER `delivery_type`;
ALTER TABLE `supplier_branch` ADD `country_code` varchar(16) COLLATE 'utf8_general_ci' NULL DEFAULT '' AFTER `is_deleted`;
ALTER TABLE `booking_cart_flow` ADD `branch_flow` int(11) NOT NULL COMMENT '0-for single branch product 1 for multiple branch product' AFTER `cart_flow`;


INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'basic_auth', '0', 'cFJSWEtPbDhpa01tdDl1OjRWajhlSzRybG9VZDI3Mkw0OGhzcmFyblVB', '0', '2020-06-10 16:56:58', '2020-06-10 16:56:58');




INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'payu_latam_api_login', '0', 'pRRXKOl8ikMmt9u', '0', '2020-06-10 16:56:58', '2020-06-10 16:56:58');

INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'payu_latam_api_key', '0', '4Vj8eK4rloUd272L48hsrarnUA', '0', '2020-06-10 16:56:58', '2020-06-10 16:56:58');

INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'payu_latam_merchant_id', '0', '508029', '0', '2020-06-10 16:56:58', '2020-06-10 16:56:58');

INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'payu_latam_account_id', '0', '512326', '0', '2020-06-10 16:56:58', '2020-06-10 16:56:58');


/**********buy_x_get_arr****/
ALTER TABLE `promoCode` ADD `category_ids` VARCHAR(50)  NULL AFTER `region_ids`;


ALTER TABLE `promoCode` CHANGE `region_ids` `region_ids` VARCHAR(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '0', CHANGE `category_ids` `category_ids` VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '0';

ALTER TABLE `product` ADD `promo_level` ENUM('0','1','2','3') NOT NULL COMMENT '0-notApplied, 1-region, 2-category, 3-product' AFTER `cart_image_upload`;


ALTER TABLE `product` ADD `promo_applied` ENUM('0','1') NOT NULL DEFAULT '0' AFTER `promo_level`;


ALTER TABLE `promoCode` ADD `product_ids` VARCHAR(100) NULL DEFAULT NULL AFTER `category_ids`;


ALTER TABLE `advertisements` ADD `show_banner_type` ENUM('0','1','2','3') NOT NULL DEFAULT '0' COMMENT '1- home, 2- coverImage 3- Both' AFTER `orders`;


ALTER TABLE `promoCode` CHANGE `bear_by` `bear_by` INT(11) NULL DEFAULT '0' COMMENT '0 for admin, 1 for supplier, 2-Both';


ALTER TABLE `promoCode` ADD `discount_percentage_by_admin` BIGINT(5) NOT NULL DEFAULT '0' AFTER `category_ids`;

ALTER TABLE `promoCode` ADD `discount_percentage_by_supplier` BIGINT(5) NOT NULL DEFAULT '0';


ALTER TABLE `promoCode` ADD `discount_amt_charge_by_admin` FLOAT(10,7) NOT NULL DEFAULT '0.0' , ADD `discount_amt_charge_by_supplier` FLOAT(10,7) NOT NULL DEFAULT '0.0' AFTER `discount_amt_charge_by_admin`


ALTER TABLE `promoCode` ADD `product_ids` VARCHAR(50) NULL AFTER `discount_percentage_by_supplier`;


ALTER TABLE `product_pricing` CHANGE `handling` `handling` DECIMAL(7,2) NULL;

ALTER TABLE `promoCode` CHANGE `category_ids` `category_ids` VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `region_ids` `region_ids` VARCHAR(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;


ALTER TABLE `advertisements` CHANGE `start_date` `start_date` VARCHAR(100) NOT NULL DEFAULT '0000-00-00 00:00:00', CHANGE `end_date` `end_date` VARCHAR(100) NOT NULL DEFAULT '0000-00-00 00:00:00';


ALTER TABLE `user` CHANGE `notification_language` `notification_language` INT(11) NOT NULL DEFAULT '16';


ALTER TABLE `orders` ADD `payment_unique_order_id` VARCHAR(200) NULL AFTER `discount_amt_charge_by_supplier`, ADD `payment_url` VARCHAR(200) NULL AFTER `payment_unique_order_id`;

ALTER TABLE `promoCode` ADD `promo_get_x_quantity` VARCHAR(100) NULL ;

ALTER TABLE `promoCode` ADD `buy_x_get_x_arr` VARCHAR(100) NULL AFTER `promo_get_x_quantity`;


ALTER TABLE `promoCode` ADD `max_buy_x_get` TEXT(1000) NOT NULL AFTER `buy_x_get_x_arr`;



ALTER TABLE `tbl_setting` ADD `key_group` VARCHAR(256) NULL DEFAULT 'default';

ALTER TABLE `orders` ADD `is_no_touch` INT(11) NOT NULL DEFAULT '0';

phone_video,website_video




INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `is_selection`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'enable_tax_exempt_on_product', '1', '0', '1', '0', '2020-11-19 05:31:50', '2021-06-24 06:27:22');

ALTER TABLE `product` ADD `tax_exempt` INT(1) NOT NULL DEFAULT '0' COMMENT '1- yes, 0- No' AFTER `tax_value`;

ALTER TABLE `cart_products` ADD `tax_exempt` INT(1) NOT NULL DEFAULT '0' COMMENT '1- yes, 0- no' AFTER `is_liquor`;


INSERT INTO `tbl_setting` (`id`, `key`, `for_front_end`, `is_selection`, `value`, `deleted_by`, `created_at`, `updated_at`) VALUES (NULL, 'active_inactive', '1', '0', '1', '0', '2020-11-19 05:31:50', '2021-07-14 12:26:06');